import { opendir, readFile } from 'fs/promises';
import util from 'util';
import { uploadToS3 } from '../backend/services/s3.service';
import { DynamoUser } from '../backend/interfaces/user';
import { DynamoImage } from '../backend/interfaces/user';
import * as crypto from 'crypto';
import { FileService } from '../backend/services/file.service';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });

const defaultImagesType = 'image/jpeg';
const fileService = new FileService();
const bucketEndpoint = 'https://stanislav-flo-test-bucket.s3.ap-northeast-1.amazonaws.com';
const bucket = 's3-bucket';
const pathToBucket = `${bucketEndpoint}/${bucket}`;
const bucketName = 'stanislav-flo-test-bucket';

export class DbService {
  async startDb(imagesDir: string): Promise<void> {
    await this.addDefaultUsersToDynamo();
    await this.addImagesDataToDynamo(imagesDir);
  }

  async putImageToDynamo(image: DynamoImage): Promise<void> {
    const input = {
      Item: {
        email: {
          S: image.email,
        },
        path: {
          S: image.path,
        },
        metadata: {
          S: JSON.stringify(image.metadata),
        },
        date: {
          S: image.date.toString(),
        },
      },
      TableName: 'module3_part2',
    };
    try {
      const command = new PutItemCommand(input);
      await client.send(command);
    } catch (error) {
      console.log(`Dynamo DB error: ${error}`);
    }
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    const crypt = util.promisify(crypto.pbkdf2);
    const hash = await crypt(password, salt, 1000, 64, 'sha512');
    return hash.toString('hex');
  }
  
  async addUser(user: DynamoUser): Promise<void> {
    const input = {
      Item: {
        email: {
          S: user.email,
        },
        path: {
          S: user.path,
        },
        password: {
          S: await this.hashPassword(user.password, user.salt),
        },
        salt: {
          S: user.salt,
        },
      },
      TableName: 'module3_part2',
    };
    try {
      const command = new PutItemCommand(input);
      await client.send(command);
    } catch (error) {
      console.log(`Dynamo DB error: ${error}`);
    }
  }

  async addDefaultUsersToDynamo(): Promise<void> {
    const defaultUsersArray = [
      {
        email: 'admin@flo.team',
        path: 'default',
        password: 'jgF5tn4F123',
        salt: crypto.randomBytes(16).toString('hex'),
      },
      {
        email: 'asergeev@flo.team',
        path: 'default',
        password: 'jgF5tn4F',
        salt: crypto.randomBytes(16).toString('hex'),
      },
      {
        email: 'tpupkin@flo.team',
        path: 'default',
        password: 'tpupkin@flo.team',
        salt: crypto.randomBytes(16).toString('hex'),
      },
      {
        email: 'vkotikov@flo.team',
        path: 'default',
        password: 'po3FGas8',
        salt: crypto.randomBytes(16).toString('hex'),
      },
    ];
  
    for (const user of defaultUsersArray) {
      await this.addUser(user);
    }
  }

  private async addImagesData(directory: string): Promise<void> {
    try {
      const dir = await opendir(directory);
      for await (const file of dir) {
        if (file.name.startsWith('.')) continue;
        const fullPath = this.createFullPath(directory, file.name);
        const isDir = await fileService.isDirectory(fullPath);

        if (isDir) {
          await this.addImagesData(fullPath);
        } else {
          // const isImage = await this.isFileInDb(file.name);
          // if (isImage) return;
          await this.saveFile(directory, file.name);
        }
      }
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: addImagesData.`);
    }
  }

  private createFullPath(directory: string, filename: string): string {
    return directory + '/' + filename;
  }

  private async saveFile(directory: string, fileName: string): Promise<void> {
    const buffer = await readFile(directory + '/' + fileName);
    const metadata = fileService.getMetadata(buffer, defaultImagesType);

    uploadToS3(buffer, fileName, bucket);
    
    const client = new S3Client({});

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: `${bucket}/${fileName}`
    });
   
    const url = await getSignedUrl(client, command, { expiresIn: 3600 }); // expiresIn - time in seconds for the signed URL to expire
    console.log('Presigned URL');
    console.log(url);

    const dynamoImage = {
      email: 'admin@flo.team',
      path: url,
      metadata: metadata,
      date: new Date(),
    };
    await this.putImageToDynamo(dynamoImage);
  }

  private async addImagesDataToDynamo(imagesDir: string): Promise<void> {
    try {
      await this.addImagesData(imagesDir);
      console.log('Images have been added to DB.');
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: addImagesDataToDB.`);
    }
  }
}