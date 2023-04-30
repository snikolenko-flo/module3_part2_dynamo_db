import { Image } from '../models/image.model';
import { log } from '@helper/logger';
import { PER_PAGE } from '../data/constants.js';
import { IResponseWithImages } from '../interfaces/response';
import { DynamoImages } from '../interfaces/image';
import { DynamoDBClient, QueryCommand, PutItemCommand, BatchGetItemCommand } from '@aws-sdk/client-dynamodb';
import util from 'util';
import * as crypto from 'crypto';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });
const defaultLimit = 60;
const dynamoTable = 'module3_part2';
const adminEmail = 'admin@flo.team';

function createParamsForQuery(email: string, limit: number) {
  let imagesLimit = limit;
  
  if(limit <= 0) {
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
};

async function getCommonImages(limit: number) {
  const params = createParamsForQuery(adminEmail, limit);
  const queryCommand = new QueryCommand(params);
  try {
    const data = await client.send(queryCommand);
    return removeUsersFromResponse(data.Items);
  } catch (err) {
    log(err);
  }
};

async function getImagesForUser(email: string, limit: number) {
  const params = createParamsForQuery(email, limit);
  const queryCommand = new QueryCommand(params);
  try {
    const data = await client.send(queryCommand);
    return removeUsersFromResponse(data.Items);
  } catch (err) {
    log(err);
  }
};

async function getImagesFromDynamoDB(limit: number, currentUser: string) {
  try {  
    const commonImages = await getCommonImages(limit);
    const userImages = await getImagesForUser(currentUser, limit);
    return commonImages.concat(userImages);
  } catch (err) {
    log(err);
  }
}

export async function getFilesAmountFromDynamoDB() {
  const params = {
    TableName: dynamoTable,
    KeyConditionExpression: '#pk = :pkval',
    ExpressionAttributeNames: {
      '#pk': 'Email',
    },
    ExpressionAttributeValues: {
      ':pkval': { S: 'admin@flo.team' },
    },
    Select: 'COUNT',
  };

  const queryCommand = new QueryCommand(params);

  try {
    const data = await client.send(queryCommand);
    return data.Count;
  } catch (err) {
    log(err);
  }
}

function removeUsersFromResponse(dynamoArray) {
  return dynamoArray.filter(function (item) {
    return String(item.ImagePath.S) !== 'default';
});
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const crypt = util.promisify(crypto.pbkdf2);
  const hash = await crypt(password, salt, 1000, 64, 'sha512');
  return hash.toString('hex');
}

export class DbService {
  async uploadImageToDynamo(fileMetadata: object, filename: string, filePath: string, userEmail: string): Promise<void> {
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
    } catch (error) {
      log(`Dynamo DB error: ${error}`);
    }
  }

  async findUserInDynamo(email: string) {
  const params = {
    TableName: dynamoTable,
    KeyConditionExpression: '#pk = :pkval',
    ExpressionAttributeNames: {
      '#pk': 'Email',
    },
    ExpressionAttributeValues: {
      ':pkval': { S: email },
    }
  };

  const queryCommand = new QueryCommand(params);

  try {
    const data = await client.send(queryCommand);
    const user = data.Items[0];

    return {
      salt: user.Salt.S,
      email: user.Email.S,
      password: user.Password.S,
      path: user.ImagePath.S
    }
  } catch (err) {
    console.error(err);
  }
 }

  async getImagesNumber(): Promise<number> {
    return Image.count();
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

  private retrieveImagesPaths(images: DynamoImages[]): (string | undefined)[] {
    return images.map((item) => item.ImagePath.S);
  }

  async getImagesFromDynamo(page: number, limit: number, pagesAmount: number, currentUser: string): Promise<IResponseWithImages> {
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
      throw Error(`${e} | class: DbService | function: getImagesFromDynamo.`);
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
      throw Error(`${e} | class: ${this.constructor.name} | function: getImages.`);
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
    } catch (error) {
      log(`Dynamo DB error: ${error}`);
    }
  }
}
