import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import parseMultipart from 'parse-multipart';
import { IFileData } from '../interfaces/file';
import jwt from 'jsonwebtoken';
import { UploadManager } from './upload.manager';
import { FileService } from '../services/file.service';
import { DynamoDB } from '../services/dynamo.service';

const secret = process.env.SECRET;
const s3ImageDirectory = process.env.S3_IMAGE_DIRECTORY;
const fileService = new FileService();
const dbService = new DynamoDB();

export const upload: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const manager = new UploadManager();

    const { filename, data, type } = extractFile(event);
    const token = event.headers.authorization;
    const decodedToken = jwt.verify(token, secret);
    const userEmail = decodedToken.user;
    const user = userEmail.split('@')[0];

    const imageMetadata = manager.getMetadata(fileService, data, type);
    const imageArray = await manager.getImagesArray(userEmail, dbService);

    imageArray.push({
      filename: filename,
      user: user,
      metadata: imageMetadata,
      date: new Date(),
    });

    await manager.updateUserInDB(userEmail, imageArray, dbService);
    await manager.uploadImageToS3(data, `${user}/${filename}`, s3ImageDirectory!);
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
