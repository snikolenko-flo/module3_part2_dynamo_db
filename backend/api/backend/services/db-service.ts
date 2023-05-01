import { log } from '@helper/logger';
import { PER_PAGE } from '../data/constants';
import { IResponseWithImages } from '../interfaces/response';
import { DynamoImages } from '../interfaces/image';
import { DynamoDBClient, QueryCommand, PutItemCommand, QueryOutput } from '@aws-sdk/client-dynamodb';
import { DynamoUser } from '../interfaces/user';
import { DynamoQueryParams } from '../interfaces/dynamo';
import util from 'util';
import * as crypto from 'crypto';

const defaultLimit = 60;
const userSortValue = 'default';
const dynamoTable = process.env.DYNAMO_TABLE;
const adminEmail = process.env.ADMIN_EMAIL;
const awsRegion = process.env.AWS_REGION;

const client = new DynamoDBClient({ region: awsRegion });

function createParamsForQuery(email: string, limit: number): DynamoQueryParams {
  let imagesLimit = limit;

  if (limit <= 0) {
    imagesLimit = defaultLimit;
  }

  return {
    TableName: dynamoTable,
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

async function getCommonImages(limit: number): Promise<QueryOutput> {
  const params = createParamsForQuery(adminEmail, limit);
  const queryCommand = new QueryCommand(params);
  try {
    const data = await client.send(queryCommand);
    return removeUsersFromResponse(data.Items);
  } catch (e) {
    throw Error(`Error: ${e} | class: DbService | function: getCommonImages.`);
  }
}

async function getImagesForUser(email: string, limit: number): Promise<QueryOutput> {
  const params = createParamsForQuery(email, limit);
  const queryCommand = new QueryCommand(params);
  try {
    const data = await client.send(queryCommand);
    return removeUsersFromResponse(data.Items);
  } catch (e) {
    throw Error(`Error: ${e} | class: DbService | function: getImagesForUser.`);
  }
}

async function getImagesFromDynamoDB(limit: number, currentUser: string): Promise<QueryOutput> {
  try {
    const commonImages = await getCommonImages(limit);
    const userImages = await getImagesForUser(currentUser, limit);
    return commonImages.concat(userImages);
  } catch (e) {
    throw Error(`Error: ${e} | class: DbService | function: getImagesFromDynamoDB.`);
  }
}

export async function getFilesAmountFromDynamoDB(): Promise<number> {
  const params = {
    TableName: dynamoTable,
    KeyConditionExpression: '#pk = :pkval',
    ExpressionAttributeNames: {
      '#pk': 'Email',
    },
    ExpressionAttributeValues: {
      ':pkval': { S: adminEmail },
    },
    Select: 'COUNT',
  };

  const queryCommand = new QueryCommand(params);

  try {
    const data = await client.send(queryCommand);
    return Number(data.Count);
  } catch (e) {
    throw Error(`Error: ${e} | class: DbService | function: getFilesAmountFromDynamoDB.`);
  }
}

function removeUsersFromResponse(dynamoArray: QueryOutput): QueryOutput {
  return dynamoArray.filter(function (item) {
    return String(item.ImagePath.S) !== userSortValue;
  });
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const crypt = util.promisify(crypto.pbkdf2);
  const hash = await crypt(password, salt, 1000, 64, 'sha512');
  return hash.toString('hex');
}

export class DbService {
  async uploadImageToDynamo(
    fileMetadata: object,
    filename: string,
    filePath: string,
    userEmail: string
  ): Promise<void> {
    const date = new Date();
    const input = {
      Item: {
        Email: {
          S: userEmail,
        },
        FileName: {
          S: filename,
        },
        ImagePath: {
          S: filePath,
        },
        Metadata: {
          S: JSON.stringify(fileMetadata),
        },
        Date: {
          S: date.toString(),
        },
      },
      TableName: dynamoTable,
    };

    try {
      const command = new PutItemCommand(input);
      await client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: uploadImageToDynamo.`);
    }
  }

  async findUserInDynamo(email: string): Promise<DynamoUser> {
    const params = {
      TableName: dynamoTable,
      KeyConditionExpression: 'Email = :pk and FileName = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: email },
        ':sk': { S: userSortValue },
      },
    };

    const queryCommand = new QueryCommand(params);

    try {
      const data = await client.send(queryCommand);
      const user = data.Items![0];

      return {
        salt: user.Salt.S,
        filename: userSortValue,
        email: user.Email.S,
        password: user.Password.S,
        path: user.ImagePath.S,
      };
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: findUserInDynamo.`);
    }
  }

  async getUserImagesNumber(userEmail: string, limit: number): Promise<number> {
    const images = await getImagesForUser(userEmail, limit);
    return images.length;
  }

  private getImagesPerPage(images: string[], page: number, perPage: number): string[] {
    const endIndex = page * perPage;
    const start = endIndex - perPage;
    return images.slice(start, endIndex);
  }

  private sortImagesFromOldToNew(images: DynamoImages[]): DynamoImages[] {
    return images.sort((a, b) => Number(a.Date.S) - Number(b.Date.S));
  }

  private retrieveImagesPaths(images: DynamoImages[]): string[] {
    try {
      return images.map((item) => item.ImagePath.S);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: retrieveImagesPaths.`);
    }
  }

  async getImagesFromDynamo(
    page: number,
    limit: number,
    pagesAmount: number,
    currentUser: string
  ): Promise<IResponseWithImages> {
    try {
      const images: DynamoImages[] = (await getImagesFromDynamoDB(limit, currentUser)) as DynamoImages[];
      const sortedImages = this.sortImagesFromOldToNew(images);
      const imagesPaths = this.retrieveImagesPaths(sortedImages);

      const paths = this.getImagesPerPage(imagesPaths, page, PER_PAGE);

      return {
        total: pagesAmount,
        objects: paths,
      };
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getImagesFromDynamo.`);
    }
  }

  async getUserImages(
    page: number,
    limit: number,
    pagesAmount: number,
    userEmail?: string
  ): Promise<IResponseWithImages> {
    try {
      const images = await getImagesForUser(userEmail!, limit);
      const sortedImages = this.sortImagesFromOldToNew(images);
      const imagesPaths = this.retrieveImagesPaths(sortedImages);

      const paths = this.getImagesPerPage(imagesPaths, page, PER_PAGE);

      return {
        total: pagesAmount,
        objects: paths,
      };
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getImages.`);
    }
  }

  async createDynamoUser(email: string, password: string, salt: string): Promise<void> {
    const input = {
      Item: {
        Email: {
          S: email,
        },
        ImagePath: {
          S: 'default',
        },
        Password: {
          S: await hashPassword(password, salt),
        },
        Salt: {
          S: salt,
        },
      },
      TableName: dynamoTable,
    };
    try {
      const command = new PutItemCommand(input);
      await client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: createDynamoUser.`);
    }
  }
}
