import { PER_PAGE } from '../data/constants';
import { IResponseWithImages } from '../interfaces/response';
import { DynamoImages } from '../interfaces/image';
import { DynamoDBClient, QueryCommand, QueryOutput } from '@aws-sdk/client-dynamodb';
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
    };
    const queryCommand = new QueryCommand(params);
    try {
      const data = await this.client.send(queryCommand);
      const imagesArray = JSON.parse(data.Items![0].Images.S!);
      return Number(imagesArray.length);
    } catch (e) {
      throw Error(`Error: ${e} | class: ImageService | function: getFilesAmountFromDynamoDB.`);
    }
  }

  async getUserImagesNumber(userEmail: string, limit: number): Promise<number> {
    const images = (await this.getImagesForUser(userEmail, limit)) as DynamoOutput;
    return images.length;
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
      if ('Images' in data.Items![0]) {
        const dynamoImages = data.Items![0].Images.S; //as DynamoImages
        const imagesOnly = JSON.parse(dynamoImages!) as DynamoImages;
        return imagesOnly;
      } else {
        return [];
      }
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getImagesForUser.`);
    }
  }

  async getImagesFromDynamoDB(limit: number, currentUser: string): Promise<DynamoImages> {
    try {
      const commonImages = await this.getCommonImages(limit);
      const userImages = await this.getImagesForUser(currentUser, limit);
      const allImages = commonImages.concat(userImages) as DynamoImages;
      return allImages;
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getImagesFromDynamoDB.`);
    }
  }

  async getCommonImages(limit: number): Promise<DynamoOutput> {
    const params = this.createParamsForQuery(this.adminEmail, limit);
    const queryCommand = new QueryCommand(params);
    try {
      const data = (await this.client.send(queryCommand)) as QueryOutput;
      const dynamoImages = data.Items![0].Images.S;
      const imagesOnly = JSON.parse(dynamoImages!) as DynamoImages;
      return imagesOnly;
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getCommonImages.`);
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

  private getImagesPerPage(images: string[], page: number, perPage: number): string[] {
    const endIndex = page * perPage;
    const start = endIndex - perPage;
    return images.slice(start, endIndex);
  }

  private sortImagesFromOldToNew(images: DynamoImages[]): DynamoImages[] {
    try {
      return images.sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date)));
    } catch (e) {
      throw Error(`Error: ${e} | class: ImageService | function: sortImagesFromOldToNew.`);
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
      const signedImageUrls = await this.createSingedUlrs(sortedImages);
      const paths = this.getImagesPerPage(signedImageUrls, page, PER_PAGE);
      return {
        total: pagesAmount,
        objects: paths,
      };
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getImagesFromDynamo.`);
    }
  }

  private async createSingedUlrs(images: DynamoImages[]): Promise<string[]> {
    try {
      return await Promise.all(
        images.map(async (item) => {
          return await this.createSignedUrl(`${item.user}/${item.filename}`);
        })
      );
    } catch (e) {
      throw Error(`Error: ${e} | e.$response: ${e.$response} | class: DbService | function: updateSignedUrls.`);
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
      const signedImageUrls = await this.createSingedUlrs(sortedImages);
      const paths = this.getImagesPerPage(signedImageUrls, page, PER_PAGE);
      return {
        total: pagesAmount,
        objects: paths,
      };
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: getImages.`);
    }
  }
}
