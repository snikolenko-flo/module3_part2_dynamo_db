import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import parseMultipart from 'parse-multipart';
import { IFileData } from '../interfaces/file';
import { DbService } from '../services/db-service';
import jwt from 'jsonwebtoken';
import { UploadManager } from './upload.manager';
import { FileService } from '../services/file.service';

const secret = process.env.SECRET;
const fileService = new FileService();
const bucketEndpoint = 'https://stanislav-flo-test-bucket.s3.ap-northeast-1.amazonaws.com';
const bucket = 's3-bucket';
const pathToBucket = `${bucketEndpoint}/${bucket}`;

export const upload: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const manager = new UploadManager();

    const { filename, data, type } = extractFile(event);
    const token = event.headers.authorization;
    const decodedToken = jwt.verify(token, secret);
    const userEmail = decodedToken.user.email;

    const s3filePath = `${pathToBucket}/${filename}`;
    const metadata = fileService.getMetadata(data, type);

    const dbService = new DbService();

    manager.uploadImageToS3(data, filename, bucket);
    await manager.uploadImageDataToDb(metadata, s3filePath, userEmail, dbService);
    return createResponse(200);
  } catch (e) {
    return errorHandler(e);
  }
};

function extractFile(event): IFileData {
  const boundary = parseMultipart.getBoundary(event.headers['content-type']);
  const parts = parseMultipart.Parse(Buffer.from(event.body, 'binary'), boundary);
  const [{ filename, data, type }] = parts;
  return {
    filename,
    data,
    type,
  };
}
