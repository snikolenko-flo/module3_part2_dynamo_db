import { opendir, readFile } from 'fs/promises';
import { uploadToS3 } from '../backend/services/s3.service';
import { ImageObject, ImageArray } from '../backend/interfaces/image';
import { FileService } from '../backend/services/file.service';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class ImageService {
  imagesType: string;
  s3Directory: string;
  bucket: string;
  table: string;
  file: FileService;
  client: DynamoDBClient;
  adminUser: string;
  expirationTime: number;

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
    this.expirationTime = 300;
  }

  async addImagesDataToDynamo(directory: string): Promise<void> {
    try {
      const imageArray = await this.createImageArray(directory);
      await this.updateDynamoUser('admin@flo.team', imageArray);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: addImagesData.`);
    }
  }

  private async createImageArray(directory: string, recursiveImageArray?: ImageArray): Promise<ImageArray> {
    let imageArray;
    if (recursiveImageArray) {
      imageArray = recursiveImageArray;
    } else {
      imageArray = [];
    }
    const dir = await opendir(directory);
    for await (const file of dir) {
      if (file.name.startsWith('.')) continue;
      const fullPath = this.createFullPath(directory, file.name);
      const isDir = await this.file.isDirectory(fullPath);
      if (isDir) {
        await this.createImageArray(fullPath, imageArray);
      } else {
        const image = await this.createImageObject(directory, file.name);
        imageArray.push(image);
      }
    }
    return imageArray;
  }

  private createFullPath(directory: string, filename: string): string {
    return directory + '/' + filename;
  }

  private async createSignedUrl(fileName: string): Promise<string> {
    const client = new S3Client({});
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: `${this.s3Directory}/${fileName}`,
    });
    return await getSignedUrl(client, command, { expiresIn: this.expirationTime });
  }

  private async createImageObject(directory: string, fileName: string): Promise<ImageObject> {
    const buffer = await readFile(directory + '/' + fileName);
    const imageMetadata = this.file.getMetadata(buffer, this.imagesType);
    await uploadToS3(buffer, `${this.adminUser}/${fileName}`, this.s3Directory);
    return {
      filename: fileName,
      user: this.adminUser,
      metadata: imageMetadata,
      date: new Date(),
    };
  }

  private async updateDynamoUser(userEmail: string, arrayOfImages: ImageArray): Promise<void> {
    const params = {
      TableName: this.table,
      Key: {
        Email: { S: userEmail },
      },
      UpdateExpression: 'SET Images = :value',
      ExpressionAttributeValues: {
        ':value': { S: JSON.stringify(arrayOfImages) },
      },
    };
    try {
      const command = new UpdateItemCommand(params);
      await this.client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: putImageToDynamo.`);
    }
  }
}
