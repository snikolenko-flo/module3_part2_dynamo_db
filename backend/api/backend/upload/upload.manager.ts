import { DbService } from '../services/db-service';
import { uploadToS3 } from '../services/s3.service';

export class UploadManager {
  uploadImageToS3(data: Buffer, filename: string, bucket: string) {
    uploadToS3(data, filename, bucket);
  }

  async uploadImageDataToDb(metadata: object, s3filePath: string, userEmail: string, dbService: DbService) {
    await dbService.uploadImageToDynamo(metadata, s3filePath, userEmail);
  }
}
