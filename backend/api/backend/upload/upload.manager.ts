import { uploadToS3 } from '../services/s3.service';
import { ImageArray } from '../interfaces/image';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileService } from '../services/file.service';

export class UploadManager {
  uploadImageToS3(data: Buffer, filename: string, bucket: string): void {
    uploadToS3(data, filename, bucket);
  }

  async getImageArray(userEmail: string, table: string): Promise<ImageArray> {
    const params = {
      TableName: table,
      Key: {
        Email: { S: userEmail },
      },
    };
    const client = new DynamoDBClient({});
    const command = new GetItemCommand(params);
    try {
      const data = await client.send(command);
        if("Images" in data.Item!) {
          const dynamoImages = data.Item.Images.S;
          return JSON.parse(dynamoImages!) as ImageArray; 
        } else {
          return [];
        }
      } catch (e) {
        throw Error(`Error: ${e} | class: UploadManager | function: getImageArray.`);
      } 
    }

    async updateDynamoUser(userEmail: string, table: string, arrayOfImages: ImageArray): Promise<void> {
      const params = {
        TableName: table,
        Key: {
          Email: { S: userEmail },
        },
        UpdateExpression: "SET Images = :value",
        ExpressionAttributeValues: {
          ":value": { S: JSON.stringify(arrayOfImages) },
        },
      };
      const client = new DynamoDBClient({});
      try {
        const command = new UpdateItemCommand(params);
        client.send(command);
      } catch (e) {
        throw Error(`Error: ${e} | class: DbService | function: putImageToDynamo.`);
      }
    }

    async createSignedUrl(bucket: string, key: string, expireTime: number): Promise<string>{
      const client = new S3Client({}) as any;
      const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }) as any;
    return getSignedUrl(client, command, { expiresIn: expireTime });
    }

    getMetadata(fileService: FileService, data: Buffer, type: string): object {
      return fileService.getMetadata(data, type);
    }
 }
