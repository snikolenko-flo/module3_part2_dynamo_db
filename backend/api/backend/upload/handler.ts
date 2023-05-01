import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import parseMultipart from 'parse-multipart';
import { IFileData } from '../interfaces/file';
import { DbService } from '../services/db-service';
import jwt from 'jsonwebtoken';
import { UploadManager } from './upload.manager';
import { FileService } from '../services/file.service';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const secret = process.env.SECRET;
const s3ImageDirectory = process.env.S3_IMAGE_DIRECTORY;
const bucket = process.env.BUCKET;

const fileService = new FileService();

export const upload: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const manager = new UploadManager();

    const { filename, data, type } = extractFile(event);
    const token = event.headers.authorization;
    const decodedToken = jwt.verify(token, secret);
    const userEmail = decodedToken.user;

    const client = new S3Client({});

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `${s3ImageDirectory}/${filename}`,
    });

    const s3filePath = await getSignedUrl(client, command, { expiresIn: 3600 }); // expiresIn - time in seconds for the signed URL to expire
    console.log('Presigned URL');
    console.log(s3filePath);

    const metadata = fileService.getMetadata(data, type);

    const dbService = new DbService();

    manager.uploadImageToS3(data, filename, s3ImageDirectory);

    await manager.uploadImageDataToDb(metadata, filename, s3filePath, userEmail, dbService);
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
