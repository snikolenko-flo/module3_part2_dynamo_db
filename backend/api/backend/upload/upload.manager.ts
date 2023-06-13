import { uploadToS3 } from '../services/s3.service';
import { ImagesArray } from '../interfaces/image';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileService } from '../services/file.service';
import { Database } from '../interfaces/database';

export class UploadManager {
  uploadImageToS3(data: Buffer, filename: string, bucket: string): void {
    uploadToS3(data, filename, bucket);
  }

  async getImagesArray(userEmail: string, dbService: Database): Promise<ImagesArray> {
    try {
      return await dbService.getImagesArray(userEmail);
    } catch (e) {
      throw Error(`Error: ${e} function: getImageArray.`);
    }
  }

  async updateUserInDB(userEmail: string, arrayOfImages: ImagesArray, dbService: Database): Promise<void> {
    try {
      return await dbService.updateUserInDB(userEmail, arrayOfImages);
    } catch (e) {
      throw Error(`Error: ${e} function: updateUserInDB.`);
    }
  }

  async createSignedUrl(bucket: string, key: string, expireTime: number): Promise<string> {
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
