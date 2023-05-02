import { PER_PAGE } from '../data/constants';
import { IResponseWithImages } from '../interfaces/response';
import { DynamoImages } from '../interfaces/image';
import { DynamoDBClient, QueryCommand, PutItemCommand, QueryOutput } from '@aws-sdk/client-dynamodb';
import { DynamoQueryParams } from '../interfaces/dynamo';

export class ImageService {
  defaultLimit: number;
  userSortValue: string;
  client: DynamoDBClient;
  table: string;
  adminEmail: string;

  constructor(dynamoTable: string, dynamoClient: DynamoDBClient) {
    this.defaultLimit = 60;
    this.userSortValue = 'default';
    this.client = dynamoClient;
    this.table = dynamoTable;
    this.adminEmail = 'admin@flo.team';
  }

  async getFilesAmountFromDynamoDB(): Promise<number> {
    const params = {
      TableName: this.table,
      KeyConditionExpression: '#pk = :pkval',
      ExpressionAttributeNames: {
        '#pk': 'Email',
      },
      ExpressionAttributeValues: {
        ':pkval': { S: this.adminEmail },
      },
      Select: 'COUNT',
    };

    const queryCommand = new QueryCommand(params);

    try {
      const data = await this.client.send(queryCommand);
      return Number(data.Count);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getFilesAmountFromDynamoDB.`);
    }
  }

  async getUserImagesNumber(userEmail: string, limit: number): Promise<number> {
    const images = await this.getImagesForUser(userEmail, limit);
    return images.length;
  }

  removeUsersFromResponse(dynamoArray: QueryOutput): QueryOutput {
    return dynamoArray.filter(function (item) {
      return String(item.ImagePath.S) !== 'default';
    });
  }

  createParamsForQuery(email: string, limit: number): DynamoQueryParams {
    let imagesLimit = limit;

    if (limit <= 0) {
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

  async getImagesForUser(email: string, limit: number): Promise<QueryOutput> {
    const params = this.createParamsForQuery(email, limit);
    const queryCommand = new QueryCommand(params);
    try {
      const data = await this.client.send(queryCommand);
      return this.removeUsersFromResponse(data.Items);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getImagesForUser.`);
    }
  }

  async getImagesFromDynamoDB(limit: number, currentUser: string): Promise<QueryOutput> {
    try {
      const commonImages = await this.getCommonImages(limit);
      const userImages = await this.getImagesForUser(currentUser, limit);
      return commonImages.concat(userImages);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getImagesFromDynamoDB.`);
    }
  }

  async getCommonImages(limit: number): Promise<QueryOutput> {
    const params = this.createParamsForQuery(this.adminEmail, limit);
    const queryCommand = new QueryCommand(params);
    try {
      const data = await this.client.send(queryCommand);
      return this.removeUsersFromResponse(data.Items);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getCommonImages.`);
    }
  }

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
      TableName: this.table,
    };

    try {
      const command = new PutItemCommand(input);
      await this.client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: uploadImageToDynamo.`);
    }
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
      const images: DynamoImages[] = (await this.getImagesFromDynamoDB(limit, currentUser)) as DynamoImages[];
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
      const images = await this.getImagesForUser(userEmail!, limit);
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
}
