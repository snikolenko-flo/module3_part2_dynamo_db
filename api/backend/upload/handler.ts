import * as parseMultipart from 'parse-multipart';
import { DbService } from '../services/db-service';
import jwt from 'jsonwebtoken';
import { uploadToS3 } from '../services/s3.service';
import { getMetadata } from '../services/file.service';
const secret = process.env.SECRET;

export const upload = async (event) => {
  const { filename, data } = extractFile(event);

  const token = event.headers.authorization;
  const decodedToken = jwt.verify(token, secret);
  const userEmail = decodedToken.user.email;

  const s3filePath = `http://localhost:4569/local-bucket/${filename}`;
  const dbService = new DbService();

  const metadata = 'hard coded metadata';
  // const metadata = getMetadata(data);
  uploadToS3(data, filename, 'local-bucket');
  await dbService.uploadImageData(metadata, s3filePath, userEmail);
}

function extractFile(event) {
  const boundary = parseMultipart.getBoundary(event.headers['content-type']);
  const parts = parseMultipart.Parse(Buffer.from(event.body), boundary);
  const [{ filename, data }] = parts;
  return {
    filename,
    data,
  };
}
