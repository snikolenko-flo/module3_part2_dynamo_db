import { PER_PAGE } from '../data/constants';
import { IResponseWithImages } from '../interfaces/response';
import { DynamoImages } from '../interfaces/image';
import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
  QueryOutput,
  BatchWriteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoQueryParams } from '../interfaces/dynamo';
import { DynamoOutput } from '../interfaces/dynamo';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class ImageService {
  defaultLimit: number;
  userSortValue: string;
  client: DynamoDBClient;
  table: string;
  adminEmail: string;
  s3ImagesDirectory: string;
  bucket: string;

  constructor(dynamoTable: string, dynamoClient: DynamoDBClient) {
    this.defaultLimit = 60;
    this.userSortValue = 'default';
    this.client = dynamoClient;
    this.table = dynamoTable;
    this.adminEmail = 'admin@flo.team';
    this.s3ImagesDirectory = 's3-bucket';
    this.bucket = 'stanislav-flo-test-bucket';
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
    const images = (await this.getImagesForUser(userEmail, limit)) as DynamoOutput;
    return images.length;
  }

  removeUsersFromResponse(dynamoArray: DynamoImages): DynamoOutput {
    return dynamoArray.filter(function (item) {
      return String(item.Type.S) !== 'user';
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

  async getImagesForUser(email: string, limit: number): Promise<DynamoImages> {
    const params = this.createParamsForQuery(email, limit);
    const queryCommand = new QueryCommand(params);
    try {
      const data = await this.client.send(queryCommand);
      const dynamoImages = data.Items as DynamoImages;
      return this.removeUsersFromResponse(dynamoImages);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getImagesForUser.`);
    }
  }

  async getImagesFromDynamoDB(limit: number, currentUser: string): Promise<DynamoImages> {
    try {
      const commonImages = await this.getCommonImages(limit);
      const userImages = await this.getImagesForUser(currentUser, limit);
      return commonImages.concat(userImages);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getImagesFromDynamoDB.`);
    }
  }

  async getCommonImages(limit: number): Promise<DynamoOutput> {
    const params = this.createParamsForQuery(this.adminEmail, limit);
    const queryCommand = new QueryCommand(params);
    try {
      const data = (await this.client.send(queryCommand)) as QueryOutput;
      const dynamoImages = data.Items as DynamoImages;
      return this.removeUsersFromResponse(dynamoImages);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getCommonImages.`);
    }
  }

  private async generateNewSignedUrls(images: DynamoImages): Promise<DynamoImages> {
    return await Promise.all(
      images.map(async (image) => {
        const url = await this.createSignedUrl(image.FileName.S);
        return {
          email: image.Email.S,
          id: image.ID.S,
          type: image.Type.S,
          filename: image.FileName.S,
          path: url,
          metadata: image.Metadata.S,
          date: new Date(),
        };
      })
    );
  }

  private createBatchArray(array: DynamoImages, size: number): object[] {
    const batchSize = size;
    const batches: object[] = [];

    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }

    return batches;
  }

  private async updateUrls(batches: DynamoImages): Promise<void> {
    batches.map(async (item) => {
      const requests = this.createParams(item);
      const params = {
        RequestItems: {
          module3_part2: requests,
        },
      };
      const client = new DynamoDBClient({});
      await client.send(new BatchWriteItemCommand(params));
    });
  }

  async updateSingedUlrs(email: string): Promise<void> {
    try {
      const images = await this.getImagesFromDynamoDB(this.defaultLimit, email);
      const newImagesArray = await this.generateNewSignedUrls(images);
      const batches = this.createBatchArray(newImagesArray, 25);
      await this.updateUrls(batches);
    } catch (e) {
      throw Error(`Error: ${e} | e.$response: ${e.$response} | class: DbService | function: updateSignedUrls.`);
    }
  }

  private createParams(array: DynamoImages): DynamoImages {
    return array.map((item) => {
      return {
        PutRequest: {
          Item: {
            Email: { S: item.email },
            ID: { S: item.id },
            ImagePath: { S: item.path },
            Type: { S: item.type },
            FileName: { S: item.filename },
            Metadata: { S: item.metadata },
            Date: { S: item.date },
          },
        },
      };
    });
  }

  private async createSignedUrl(fileName: string) {
    const client = new S3Client({}) as any;

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: `${this.s3ImagesDirectory}/${fileName}`,
    }) as any;

    return await getSignedUrl(client, command, { expiresIn: 120 }); // expiresIn - time in seconds for the signed URL to expire
  }

  async uploadImageToDynamo(
    fileMetadata: object,
    imageID: string,
    type: string,
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
        ID: {
          S: imageID,
        },
        Type: {
          S: type,
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
    return images.sort((a, b) => Number(a.Date!.S) - Number(b.Date!.S));
  }

  private retrieveImagesPaths(images: DynamoImages[]): string[] {
    try {
      return images.map((item) => item.ImagePath!.S);
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
      const images = await this.getImagesFromDynamoDB(limit, currentUser);
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
