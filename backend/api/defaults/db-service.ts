import { opendir, readFile } from 'fs/promises';
import util from 'util';
import { uploadToS3 } from '../backend/services/s3.service';
import { DynamoImage, DynamoUser } from '../backend/interfaces/user';
import * as crypto from 'crypto';
import { FileService } from '../backend/services/file.service';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const defaultImagesType = 'image/jpeg';
const s3ImagesDirectory = 's3-bucket';
const bucket = 'stanislav-flo-test-bucket';
const dynamoTable = 'module3_part2';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });
const fileService = new FileService();

export class DbService {
  async startDb(imagesDir: string): Promise<void> {
    await this.addDefaultUsersToDynamo();
    await this.addImagesDataToDynamo(imagesDir);
  }

  async putImageToDynamo(image: DynamoImage): Promise<void> {
    const input = {
      Item: {
        Email: {
          S: image.email,
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
      TableName: dynamoTable,
      ConditionExpression: 'attribute_not_exists(Email) AND attribute_not_exists(FileName)',
    };
    try {
      const command = new PutItemCommand(input);
      await client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: putImageToDynamo.`);
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
        Email: {
          S: user.email,
        },
        FileName: {
          S: user.filename,
        },
        ImagePath: {
          S: user.path,
        },
        Password: {
          S: await this.hashPassword(user.password, user.salt),
        },
        Salt: {
          S: user.salt,
        },
      },
      TableName: dynamoTable,
    };
    try {
      const command = new PutItemCommand(input);
      await client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: addUser.`);
    }
  }

  async addDefaultUsersToDynamo(): Promise<void> {
    const defaultUsersArray = [
      {
        email: 'admin@flo.team',
        filename: 'default',
        path: 'default',
        password: 'jgF5tn4F123',
        salt: crypto.randomBytes(16).toString('hex'),
      },
      {
        email: 'asergeev@flo.team',
        filename: 'default',
        path: 'default',
        password: 'jgF5tn4F',
        salt: crypto.randomBytes(16).toString('hex'),
      },
      {
        email: 'tpupkin@flo.team',
        filename: 'default',
        path: 'default',
        password: 'tpupkin@flo.team',
        salt: crypto.randomBytes(16).toString('hex'),
      },
      {
        email: 'vkotikov@flo.team',
        filename: 'default',
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

  private async saveFile(directory: string, fileName: string): Promise<void> {
    const buffer = await readFile(directory + '/' + fileName);
    const metadata = fileService.getMetadata(buffer, defaultImagesType);

    uploadToS3(buffer, fileName, s3ImagesDirectory);

    const client = new S3Client({});

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `${s3ImagesDirectory}/${fileName}`,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 }); // expiresIn - time in seconds for the signed URL to expire

    const dynamoImage = {
      email: 'admin@flo.team',
      filename: fileName,
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
      throw Error(`${e} | class: DbService | function: addImagesDataToDB.`);
    }
  }
}
