import * as parseMultipart from 'parse-multipart';
import { DbService } from '../services/db-service';
import { log } from '@helper/logger';
import jwt from 'jsonwebtoken';
import { uploadToS3 } from '../services/s3.service';

const secret = process.env.SECRET;

export const upload = async (event) => {
  const { filename, data } = extractFile(event);

  const token = event.headers.authorization;
  const decodedToken = jwt.verify(token, secret);
  const userEmail = decodedToken.user.email;

  const s3filePath = `http://localhost:4569/local-bucket/${filename}`;
  const dbService = new DbService();
  uploadToS3(data, filename, 'local-bucket');
  await dbService.uploadImageData(s3filePath, userEmail);
};

function extractFile(event) {
  const boundary = parseMultipart.getBoundary(event.headers['content-type']);
  const parts = parseMultipart.Parse(Buffer.from(event.body), boundary);
  const [{ filename, data }] = parts;
  return {
    filename,
    data,
  };
}
