import { DynamoUser, IUser, DynamoImage } from '../interfaces/user';
import { Image } from '../models/image.model';
import { User } from '../models/user.model';
import { log } from '@helper/logger';
import { PER_PAGE } from '../data/constants.js';
import { IResponseWithImages } from '../interfaces/response';
import { Images, DynamoImages } from '../interfaces/image';
import { DynamoDBClient, QueryCommand, PutItemCommand, BatchGetItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });
const defaultLimit = 60;
const DB_TABLE = 'module3_part2';
const adminEmail = 'admin@flo.team';

function createParamsForQuery(email: string, limit: number) {
  let imagesLimit = limit;
  
  if(limit <= 0) {
    imagesLimit = defaultLimit;
  }

  return {
    TableName: DB_TABLE,
    KeyConditionExpression: '#pk = :pkval',
    ExpressionAttributeNames: {
      '#pk': 'email',
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
    console.error(err);
  }
};

async function getImagesForUser(email: string, limit: number) {
  const params = createParamsForQuery(email, limit);
  const queryCommand = new QueryCommand(params);
  try {
    const data = await client.send(queryCommand);
    return removeUsersFromResponse(data.Items);
  } catch (err) {
    console.error(err);
  }
};

async function getImagesFromDynamoDB(limit: number, currentUser: string) {
  try {  
    const commonImages = await getCommonImages(limit);
    const userImages = await getImagesForUser(currentUser, limit);
    return commonImages.concat(userImages);
  } catch (err) {
    console.error(err);
  }
}

export async function getFilesAmountFromDynamoDB() {
  const params = {
    TableName: 'module3_part2',
    KeyConditionExpression: '#pk = :pkval',
    ExpressionAttributeNames: {
      '#pk': 'email',
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
    console.error(err);
  }
}

function removeUsersFromResponse(dynamoArray) {
  return dynamoArray.filter(function (item) {
    return String(item.path.S) !== 'default';
});
}

export class DbService {
  async uploadImageToDynamo(fileMetadata: object, filePath: string, userEmail: string): Promise<void> {
    const date = new Date();
    const input = {
      Item: {
        email: {
          S: userEmail,
        },
        path: {
          S: filePath,
        },
        metadata: {
          S: JSON.stringify(fileMetadata),
        },
        date: {
          S: date.toString(),
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

  async findUserInDynamo(email: string) {
  const params = {
    TableName: 'module3_part2',
    KeyConditionExpression: '#pk = :pkval',
    ExpressionAttributeNames: {
      '#pk': 'email',
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
      salt: user.salt.S,
      email: user.email.S,
      password: user.password.S,
      path: user.path.S
    }
  } catch (err) {
    console.error(err);
  }
 }

  async getImagesNumber(): Promise<number> {
    return Image.count();
  }

  async getUserImagesNumber(userEmail: string, limit: number): Promise<number> {
    const images = await this.getImagesOfUser(userEmail, limit);
    return images.length;
  }

  private getImagesPerPage(images: string[], page: number, perPage: number): string[] {
    const endIndex = page * perPage;
    const start = endIndex - perPage;
    return images.slice(start, endIndex);
  }

  private sortImagesFromOldToNew(images: DynamoImages[]): DynamoImages[] {
    return images.sort((a, b) => Number(a.date.S) - Number(b.date.S));
  }

  private retrieveImagesPaths(images: DynamoImages[]): (string | undefined)[] {
    return images.map((item) => item.path.S);
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

  private async getImagesOfUser(userEmail: string, limit: number): Promise<Images[]> {
    try {
      const user = await User.findOne({ email: userEmail }).exec();
      const images: Images[] = (await Image.find({ user: user!.id })
        .select(['path', 'date'])
        .sort({ date: -1 })
        .limit(limit)) as Images[];
      return images;
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: getImagesOfUser.`);
    }
  }

  async getUserImages(
    page: number,
    limit: number,
    pagesAmount: number,
    userEmail?: string
  ): Promise<IResponseWithImages> {
    try {
      const images = await this.getImagesOfUser(userEmail!, limit);
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

  async createUser(email: string, password: string, salt: string): Promise<IUser> {
    return (await User.create({ email, password, salt })) as IUser;
  }
}
