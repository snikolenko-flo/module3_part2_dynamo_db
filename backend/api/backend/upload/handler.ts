import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import parseMultipart from 'parse-multipart';
import { DbService } from '../services/db-service';
import jwt from 'jsonwebtoken';
import { getMetadata } from '../services/file.service';
import { UploadManager } from './upload.manager';

const secret = process.env.SECRET;

export const upload = async (event) => {
  try {
    const manager = new UploadManager();

    const { filename, data, type } = extractFile(event);
    const token = event.headers.authorization;
    const decodedToken = jwt.verify(token, secret);
    const userEmail = decodedToken.user.email;

    const s3filePath = `http://localhost:4569/local-bucket/${filename}`;
    const metadata = getMetadata(data, type);

    const dbService = new DbService();

    manager.uploadImageToS3(data, filename, 'local-bucket');
    await manager.uploadImageDataToDb(metadata, s3filePath, userEmail, dbService);
    return createResponse(200);
  } catch (e) {
    return errorHandler(e);
  }
};

function extractFile(event) {
  const boundary = parseMultipart.getBoundary(event.headers['content-type']);
  const parts = parseMultipart.Parse(Buffer.from(event.body, 'binary'), boundary);
  const [{ filename, data, type }] = parts;
  return {
    filename,
    data,
    type,
  };
}
