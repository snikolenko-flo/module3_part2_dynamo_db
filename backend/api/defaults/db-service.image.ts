import { opendir, readFile } from 'fs/promises';
import { uploadToS3 } from '../backend/services/s3.service';
import { DynamoImage } from '../backend/interfaces/user';
import { FileService } from '../backend/services/file.service';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { defaultUsersArray } from './default.users';

export class ImageService {
  imagesType: string;
  s3Directory: string;
  bucket: string;
  table: string;
  file: FileService;
  client: DynamoDBClient;
  adminUser: string;

  constructor(
    defaultImagesType: string,
    s3ImagesDirectory: string,
    s3Bucket: string,
    dynamoTable: string,
    dynamoClient: DynamoDBClient,
    fileService: FileService
  ) {
    this.imagesType = defaultImagesType;
    this.s3Directory = s3ImagesDirectory;
    this.bucket = s3Bucket;
    this.table = dynamoTable;
    this.client = dynamoClient;
    this.file = fileService;
    this.adminUser = 'admin';
  }

  async addImagesDataToDynamo(imagesDir: string): Promise<void> {
    try {
      await this.addImagesData(imagesDir);
      console.log('Images have been added to DB.');
    } catch (e) {
      throw Error(`${e} | class: DbService | function: addImagesDataToDynamo.`);
    }
  }

  private async addImagesData(directory: string): Promise<void> {
    try {
      const dir = await opendir(directory);
      for await (const file of dir) {
        if (file.name.startsWith('.')) continue;
        const fullPath = this.createFullPath(directory, file.name);
        const isDir = await this.file.isDirectory(fullPath);

        if (isDir) {
          await this.addImagesData(fullPath);
        } else {
          await this.saveFile(directory, file.name);
        }
      }
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: addImagesData.`);
    }
  }

  private createFullPath(directory: string, filename: string): string {
    return directory + '/' + filename;
  }

  private async createSignedUrl(fileName: string) {
    const client = new S3Client({});

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: `${this.s3Directory}/${fileName}`,
    });

    return await getSignedUrl(client, command, { expiresIn: 120 }); // expiresIn - time in seconds for the signed URL to expire
  }

  private async saveFile(directory: string, fileName: string): Promise<void> {
    const buffer = await readFile(directory + '/' + fileName);
    const metadata = this.file.getMetadata(buffer, this.imagesType);

    uploadToS3(buffer, `${this.adminUser}/${fileName}`, this.s3Directory);
    const url = await this.createSignedUrl(`${this.adminUser}/${fileName}`);

    console.log('url');
    console.log(url);
    
    const dynamoImage = {
      email: 'admin@flo.team',
      id: uuidv4(),
      type: 'image',
      filename: fileName,
      path: url,
      metadata: metadata,
      date: new Date(),
    };
    try {
      await this.putImageToDynamo(dynamoImage);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: saveFile.`);
    }
  }

  private async putImageToDynamo(image: DynamoImage): Promise<void> {
    console.log(`image.path: ${image.path}`);

    const input = {
      Item: {
        Email: {
          S: image.email,
        },
        ID: {
          S: image.id,
        },
        Type: {
          S: image.type,
        },
        FileName: {
          S: image.filename,
        },
        ImagePath: {
          S: image.path,
        },
        Metadata: {
          S: JSON.stringify(image.metadata),
        },
        Date: {
          S: image.date.toString(),
        },
      },
      TableName: this.table,
      //ConditionExpression: 'attribute_not_exists(Email) AND attribute_not_exists(FileName)',
    };
    try {
      const command = new PutItemCommand(input);
      await this.client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: putImageToDynamo.`);
    }
  }
}
