import { DbService } from '../services/db-service';
import { uploadToS3 } from '../services/s3.service';

export class UploadManager {
  uploadImageToS3(data: Buffer, filename: string, bucket: string): void {
    uploadToS3(data, filename, bucket);
  }

  async uploadImageDataToDb(metadata: object, filename: string, s3filePath: string, userEmail: string, dbService: DbService): Promise<void> {
    await dbService.uploadImageToDynamo(metadata, filename, s3filePath, userEmail);
  }
}
