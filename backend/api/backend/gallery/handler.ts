import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import mongoose from 'mongoose';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DbService } from '../services/db-service';
import { GalleryManager } from './gallery.manager';
import { getFilesAmountFromDynamoDB } from '../services/db-service';
const mongoUrl = process.env.MONGO_URL;
import jwt from 'jsonwebtoken';
const secret = process.env.SECRET;

export const getGallery: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const manager = new GalleryManager();

    const params = event.queryStringParameters;
    const pageNumber = parseInt(params!.page!);
    const pageLimit = parseInt(params!.limit!);
    const user = params!.filter;

    const token = event['headers'].authorization;
    const decodedToken = jwt.verify(token, secret);
    console.log('decodedToken');
    console.log(decodedToken);
    const currentUser = decodedToken.user;
    console.log(`currentUser: ${currentUser}`);

    if (isNaN(pageNumber)) return createResponse(400, { message: 'The page number should be an integer' });
    if (!isFinite(pageNumber)) return createResponse(400, { message: 'The page number should be a finite integer' });
    await mongoose.connect(mongoUrl!);

    const dbService = new DbService();
    return await manager.getGallery(user!, pageNumber, pageLimit, dbService, currentUser);
  } catch (e) {
    return errorHandler(e);
  }
};

export const getImagesLimit: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const pageLimit = await getFilesAmountFromDynamoDB();
    const limit = JSON.stringify({ limit: pageLimit });
    log(`Page limit ${limit} was sent to the frontend.`);
    return createResponse(200, limit);
  } catch (e) {
    return errorHandler(e);
  }
};
