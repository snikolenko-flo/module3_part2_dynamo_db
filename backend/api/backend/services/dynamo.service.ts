import { DynamoDBClient, QueryCommand, PutItemCommand, QueryOutput } from '@aws-sdk/client-dynamodb';
import { hashPassword } from './helper';
import { Database } from '../interfaces/database';
import { IUser } from '../interfaces/user';
import { PER_PAGE } from '../data/constants';
import { IResponseWithImages } from '../interfaces/response';
import { DynamoImages, ImagesArray, ImageObject } from '../interfaces/image';
import { DynamoQueryParams, DynamoOutput } from '../interfaces/dynamo';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import util from 'util';
import * as crypto from 'crypto';
import { opendir, readFile } from 'fs/promises';
import { FileService } from './file.service';
import { uploadToS3 } from './s3.service';

const dynamoTable = process.env.DYNAMO_TABLE;
const awsRegion = process.env.AWS_REGION;
const dynamoClient = new DynamoDBClient({ region: awsRegion });
const fileService = new FileService();

export class DynamoDB extends Database {
  defaultLimit: number;
  userSortValue: string;
  client: DynamoDBClient;
  table: string;
  adminEmail: string;
  s3ImagesDirectory: string;
  bucket: string;
  file: FileService;
  adminUser: string;
  imagesType: string;

  constructor() {
    super();
    this.userSortValue = 'default';
    this.defaultLimit = 60;
    this.defaultLimit = 60;
    this.userSortValue = 'default';
    this.client = dynamoClient;
    this.table = dynamoTable ? dynamoTable : 'module3_part2';
    this.adminEmail = 'admin@flo.team';
    this.s3ImagesDirectory = 's3-bucket';
    this.bucket = 'stanislav-flo-test-bucket';
    this.file = fileService;
    this.imagesType = 'image/jpeg';
  }

  async addImagesDataToDB(directory: string): Promise<void> {
    try {
      const imageArray = await this.createImageArray(directory);
      await this.updateUserInDB(this.adminEmail, imageArray);
    } catch (e) {
      throw Error(`Error: ${e} function: addImagesDataToDB.`);
    }
  }

  private async createImageArray(directory: string, recursiveImageArray?: ImagesArray): Promise<ImagesArray> {
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

  private async createImageObject(directory: string, fileName: string): Promise<ImageObject> {
    const buffer = await readFile(directory + '/' + fileName);
    const imageMetadata = this.file.getMetadata(buffer, this.imagesType);
    await uploadToS3(buffer, `${this.adminEmail}/${fileName}`, this.s3ImagesDirectory);
    return {
      filename: fileName,
      user: this.adminEmail,
      metadata: imageMetadata,
      date: new Date(),
    };
  }

  async addDefaultUsersToDB(usersArray: IUser[]): Promise<void> {
    for (const user of usersArray) {
      await this.addUser(user);
    }
  }

  private async addUser(user: IUser): Promise<void> {
    const input = {
      Item: {
        Email: {
          S: user.email,
        },
        Password: {
          S: await this.hashPassword(user.password, user.salt),
        },
        Salt: {
          S: user.salt,
        },
      },
      TableName: this.table,
    };
    try {
      const command = new PutItemCommand(input);
      await this.client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} function: addUser.`);
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const crypt = util.promisify(crypto.pbkdf2);
    const hash = await crypt(password, salt, 1000, 64, 'sha512');
    return hash.toString('hex');
  }

  async getImagesArray(userEmail: string): Promise<ImagesArray> {
    const params = {
      TableName: this.table,
      Key: {
        Email: { S: userEmail },
      },
    };
    const client = new DynamoDBClient({});
    const command = new GetItemCommand(params);
    try {
      const data = await client.send(command);
      if ('Images' in data.Item!) {
        const dynamoImages = data.Item.Images.S;
        return JSON.parse(dynamoImages!) as ImagesArray;
      } else {
        return [];
      }
    } catch (e) {
      throw Error(`Error: ${e} function: getImageArray.`);
    }
  }

  async updateUserInDB(userEmail: string, arrayOfImages: ImagesArray): Promise<void> {
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
    const client = new DynamoDBClient({});
    try {
      const command = new UpdateItemCommand(params);
      client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} function: updateUserInDB.`);
    }
  }

  async findUser(email: string): Promise<IUser> {
    const params = {
      TableName: this.table,
      KeyConditionExpression: 'Email = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: email },
      },
    };

    const queryCommand = new QueryCommand(params);

    try {
      const data = await this.client.send(queryCommand);
      const user = data.Items![0];

      return {
        email: user.Email.S!,
        password: user.Password.S!,
        salt: user.Salt.S!,
      };
    } catch (e) {
      throw Error(`Error: ${e} function: findUser.`);
    }
  }

  async createUser(email: string, password: string, salt: string): Promise<void> {
    const input = {
      Item: {
        Email: {
          S: email,
        },
        Password: {
          S: await hashPassword(password, salt),
        },
        Salt: {
          S: salt,
        },
      },
      TableName: this.table,
    };
    try {
      const command = new PutItemCommand(input);
      await this.client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} function: createUser.`);
    }
  }

  async getNumberOfAllImages(user: string): Promise<number> {
    try {
      const commonImages = await this.getCommonImages();
      const userImages = await this.getImagesForUserOnly(user);
      const imagesArray = commonImages.concat(userImages);
      return Number(imagesArray.length);
    } catch (e) {
      throw Error(`Error: ${e} function: getNumberOfAllImages.`);
    }
  }

  async getNumberOfSharedImages(): Promise<number> {
    const params = {
      TableName: this.table,
      KeyConditionExpression: '#pk = :pkval',
      ExpressionAttributeNames: {
        '#pk': 'Email',
      },
      ExpressionAttributeValues: {
        ':pkval': { S: this.adminEmail },
      },
    };
    const queryCommand = new QueryCommand(params);
    try {
      const data = await this.client.send(queryCommand);
      const imagesArray = JSON.parse(data.Items![0].Images.S!);
      return Number(imagesArray.length);
    } catch (e) {
      throw Error(`Error: ${e} function: getNumberOfSharedImages.`);
    }
  }

  async getNumberOfImagesForUser(userEmail: string, limit: number): Promise<number> {
    const images = (await this.getImagesForUserOnly(userEmail, limit)) as DynamoOutput;
    return images.length;
  }

  private createParamsForQuery(email: string, limit?: number): DynamoQueryParams {
    let imagesLimit = limit;

    if (limit === undefined) {
      return {
        TableName: this.table,
        KeyConditionExpression: '#pk = :pkval',
        ExpressionAttributeNames: {
          '#pk': 'Email',
        },
        ExpressionAttributeValues: {
          ':pkval': { S: email },
        },
        Limit: imagesLimit,
      };
    } else if (limit <= 0) {
      imagesLimit = this.defaultLimit;
    }
    return {
      TableName: this.table,
      KeyConditionExpression: '#pk = :pkval',
      ExpressionAttributeNames: {
        '#pk': 'Email',
      },
      ExpressionAttributeValues: {
        ':pkval': { S: email },
      },
      Limit: imagesLimit,
    };
  }

  private async getImagesForUserOnly(email: string, limit?: number): Promise<DynamoImages | []> {
    let params;
    if (limit) {
      params = this.createParamsForQuery(email, limit);
    } else {
      params = this.createParamsForQuery(email);
    }
    const queryCommand = new QueryCommand(params);
    try {
      const data = await this.client.send(queryCommand);
      if ('Images' in data.Items![0]) {
        const dynamoImages = data.Items![0].Images.S;
        const imagesOnly = JSON.parse(dynamoImages!) as DynamoImages;
        return imagesOnly;
      } else {
        return [];
      }
    } catch (e) {
      throw Error(`Error: ${e} function: getImagesForUserOnly.`);
    }
  }

  private async getImagesFromDynamoDB(limit: number, currentUser: string): Promise<DynamoImages> {
    try {
      const commonImages = await this.getCommonImages(limit);
      const userImages = await this.getImagesForUserOnly(currentUser, limit);
      const allImages = commonImages.concat(userImages) as DynamoImages;
      return allImages;
    } catch (e) {
      throw Error(`Error: ${e} function: getImagesFromDynamoDB.`);
    }
  }

  private async getCommonImages(limit?: number): Promise<DynamoOutput> {
    let params;
    if (limit) {
      params = this.createParamsForQuery(this.adminEmail, limit);
    } else {
      params = this.createParamsForQuery(this.adminEmail);
    }
    const queryCommand = new QueryCommand(params);
    try {
      const data = (await this.client.send(queryCommand)) as QueryOutput;
      const dynamoImages = data.Items![0].Images.S;
      const imagesOnly = JSON.parse(dynamoImages!) as DynamoImages;
      return imagesOnly;
    } catch (e) {
      throw Error(`Error: ${e} function: getCommonImages.`);
    }
  }

  private async createSignedUrl(fileName: string): Promise<string> {
    const client = new S3Client({}) as any;
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: `${this.s3ImagesDirectory}/${fileName}`,
    }) as any;
    const seconds = 120;
    return await getSignedUrl(client, command, { expiresIn: seconds });
  }

  private getImagesPerPage(images: ImagesArray, page: number, perPage: number): ImagesArray {
    const endIndex = page * perPage;
    const start = endIndex - perPage;
    return images.slice(start, endIndex);
  }

  private sortImagesFromOldToNew(images: ImagesArray): ImagesArray {
    try {
      return images.sort((a, b) => {
        return Number(new Date(a.date)) - Number(new Date(b.date));
      });
    } catch (e) {
      throw Error(`Error: ${e} function: sortImagesFromOldToNew.`);
    }
  }

  async getImagesForOnePage(
    page: number,
    limit: number,
    pagesAmount: number,
    currentUser: string
  ): Promise<IResponseWithImages> {
    try {
      const images = await this.getImagesFromDynamoDB(limit, currentUser);
      const sortedImages = this.sortImagesFromOldToNew(images);
      const paths = this.getImagesPerPage(sortedImages, page, PER_PAGE);
      const signedImageUrls = await this.createSingedUlrs(paths);

      return {
        total: pagesAmount,
        objects: signedImageUrls,
      };
    } catch (e) {
      throw Error(`Error: ${e} function: getImagesForOnePage.`);
    }
  }

  private async createSingedUlrs(images: ImagesArray): Promise<string[]> {
    try {
      return await Promise.all(
        images.map(async (item) => {
          return await this.createSignedUrl(`${item.user}/${item.filename}`);
        })
      );
    } catch (e) {
      throw Error(`Error: ${e} | e.$response: ${e.$response} | function: createSignedUrls.`);
    }
  }

  async getImagesForUser(
    page: number,
    limit: number,
    pagesAmount: number,
    userEmail?: string
  ): Promise<IResponseWithImages> {
    try {
      const images = await this.getImagesForUserOnly(userEmail!, limit);
      const sortedImages = this.sortImagesFromOldToNew(images);
      const paths = this.getImagesPerPage(sortedImages, page, PER_PAGE);
      const signedImageUrls = await this.createSingedUlrs(paths);

      return {
        total: pagesAmount,
        objects: signedImageUrls,
      };
    } catch (e) {
      throw Error(`Error: ${e} function: getImagesForUser.`);
    }
  }
}
