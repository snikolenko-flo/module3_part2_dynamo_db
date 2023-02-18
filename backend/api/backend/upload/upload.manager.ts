import { uploadToS3 } from '../services/s3.service';

export class UploadManager {
  uploadImageToS3(data, filename, bucket) {
    uploadToS3(data, filename, bucket);
  }

  async uploadImageDataToDb(metadata, s3filePath, userEmail, dbService) {
    await dbService.uploadImageData(metadata, s3filePath, userEmail);
  }
}
