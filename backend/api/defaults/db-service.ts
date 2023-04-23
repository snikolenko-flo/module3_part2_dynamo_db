import { opendir, readFile } from 'fs/promises';
import util from 'util';
import { Images } from '../backend/interfaces/image';
import { uploadToS3 } from '../backend/services/s3.service';
import { Image } from '../backend/models/image.model';
import { User } from '../backend/models/user.model';
import { DynamoUser } from '../backend/interfaces/user';
import { DynamoImage } from '../backend/interfaces/user';
import * as crypto from 'crypto';
import { FileService } from '../backend/services/file.service';
import mongoose from 'mongoose';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });

async function hashPassword(password: string, salt: string): Promise<string> {
  const crypt = util.promisify(crypto.pbkdf2);
  const hash = await crypt(password, salt, 1000, 64, 'sha512');
  return hash.toString('hex');
}

async function addUser(user: DynamoUser): Promise<void> {
  const input = {
    Item: {
      email: {
        S: user.email,
      },
      path: {
        S: user.path,
      },
      password: {
        S: await hashPassword(user.password, user.salt),
      },
      salt: {
        S: user.salt,
      },
    },
    TableName: 'module3_part2',
  };
  try {
    const command = new PutItemCommand(input);
    const response = await client.send(command);
    console.log(`Dynamo DB response: ${response}`);
  } catch (error) {
    console.log(`Dynamo DB error: ${error}`);
  }
}
async function addDefaultUsersToDynamo(): Promise<void> {
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
    await addUser(user);
  }
}

async function putImageToDynamo(image: DynamoImage): Promise<void> {
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
    const response = await client.send(command);
    console.log(`Dynamo DB response: ${response}`);
  } catch (error) {
    console.log(`Dynamo DB error: ${error}`);
  }
}

const defaultImagesType = 'image/jpeg';
const fileService = new FileService();
const bucketEndpoint = 'https://stanislav-flo-test-bucket.s3.ap-northeast-1.amazonaws.com';
const bucket = 's3-bucket';
const pathToBucket = `${bucketEndpoint}/${bucket}`;

export class DbService {
  async startDb(imagesDir: string, mongoUrl: string): Promise<void> {
    await this.connectToDb(mongoUrl);
    await addDefaultUsersToDynamo();
    await this.addDefaultUsersToDB();
    await this.addImagesDataToDB(imagesDir);
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

    const dynamoImage = {
      email: 'admin@flo.team',
      path: `${pathToBucket}/${fileName}`,
      metadata: metadata,
      date: new Date(),
    };
    await putImageToDynamo(dynamoImage);
  }

  // private async isFileInDb(fileName: string): Promise<Images> {
  //   return await Image.findOne({ path: `${pathToBucket}/${fileName}` }).exec();
  // }

  private async addDefaultUsers(): Promise<void> {
    const defaultUsersArray = ['asergeev@flo.team', 'tpupkin@flo.team', 'vkotikov@flo.team'];

    try {
      const records = await User.find({ email: { $in: defaultUsersArray } });
      if (records.length) return;

      const asergeev = new User({
        email: 'asergeev@flo.team',
        password: 'jgF5tn4F',
        salt: crypto.randomBytes(16).toString('hex'),
      });
      await asergeev.save();
      console.log(`The user ${asergeev.email} was saved to DB.`);

      const tpupkin = new User({
        email: 'tpupkin@flo.team',
        password: 'tpupkin@flo.team',
        salt: crypto.randomBytes(16).toString('hex'),
      });
      await tpupkin.save();
      console.log(`The user ${tpupkin.email} was saved to DB.`);

      const vkotikov = new User({
        email: 'vkotikov@flo.team',
        password: 'po3FGas8',
        salt: crypto.randomBytes(16).toString('hex'),
      });
      await vkotikov.save();
      console.log(`The user ${vkotikov.email} was saved to DB.`);
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: addDefaultUsers.`);
    }
  }

  private async connectToDb(mongoUrl: string): Promise<void> {
    try {
      await mongoose.connect(mongoUrl);
      console.log(`Database is running at ${mongoUrl}`);
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: connectToDb.`);
    }
  }

  private async addDefaultUsersToDB(): Promise<void> {
    try {
      await this.addDefaultUsers();
      console.log('Default users have been added to DB.');
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: addDefaultUsersToDB.`);
    }
  }

  private async addImagesDataToDB(imagesDir: string): Promise<void> {
    try {
      await this.addImagesData(imagesDir);
      console.log('Images have been added to DB.');
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: addImagesDataToDB.`);
    }
  }
}