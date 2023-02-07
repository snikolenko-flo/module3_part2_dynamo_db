import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as parseMultipart from 'parse-multipart';
import { DbService } from '../services/db-service';
import { log } from '@helper/logger';
import jwt from 'jsonwebtoken';

const secret = process.env.SECRET;

export const upload = (event, context, callback) => {
  const { filename, data } = extractFile(event);

  const token = event.headers.authorization;
  const decodedToken = jwt.verify(token, secret);
  const userEmail = decodedToken.user.email;

  const s3filePath = `http://localhost:4569/local-bucket/${filename}`;
  const dbService = new DbService();

  const client = new S3Client({
    forcePathStyle: true,
    credentials: {
      accessKeyId: 'S3RVER', // This specific key is required when working offline
      secretAccessKey: 'S3RVER',
    },
    endpoint: 'http://localhost:4569',
  });

  log(`the client ${client} is created`);

  client
    .send(
      new PutObjectCommand({
        Bucket: 'local-bucket',
        Key: filename,
        Body: Buffer.from(data),
      })
    )
    .then(() => callback(null, 'ok'))
    .then(async () => {
      console.log('Add image data to db');
      await dbService.uploadImageData(s3filePath, userEmail);
    })
    .catch((e) => console.log(`The error ${e} has happened`));
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
