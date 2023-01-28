import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import mongoose from 'mongoose';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DbService } from '../services/db-service';
import { GalleryManager } from './gallery.manager';

const mongoUrl = process.env.MONGO_URL;
const IMAGES_DIR = process.env.IMAGES_DIR;
const dbService = new DbService();

export const getGallery: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const manager = new GalleryManager();

    const params = event.queryStringParameters;
    const pageNumber = parseInt(params!.page!);
    const pageLimit = parseInt(params!.limit!);
    const user = params!.filter;

    if (isNaN(pageNumber)) return createResponse(400, { message: 'The page number should be an integer' });
    if (!isFinite(pageNumber)) return createResponse(400, { message: 'The page number should be a finite integer' });

    let total = await manager.file.getTotalPages(IMAGES_DIR!);
    if (user) {
      const userImagesNumber = await dbService.getUserImagesNumber(user, pageLimit);
      total = await manager.file.getUserPagesNumber(IMAGES_DIR!, userImagesNumber);
    }

    const totalForLimit = await manager.file.getTotalPagesForLimit(IMAGES_DIR!, pageLimit);

    if (pageNumber > total || pageNumber <= 0)
      return createResponse(400, { message: `Page should be greater than 0 and less than ${total + 1}` });
    log(`The page number ${pageNumber} is ok.`);

    if (pageNumber > totalForLimit || pageNumber <= 0)
      return createResponse(400, { message: `Page should be greater than 0 and less than ${total + 1}` });
    log(`The page number ${pageNumber} is ok.`);

    let pagesAmount = await manager.file.getPagesAmount(IMAGES_DIR!, pageLimit);
    if (pagesAmount > total) pagesAmount = total;

    await mongoose.connect(mongoUrl!);
    if (user) {
      log(`A user ${user} was specified.`);
      const imagesPaths = await dbService.getUserImages(pageNumber, pageLimit, user);
      log(`Got images for user ${user}.`);

      return createResponse(200, {
        total: pagesAmount,
        objects: imagesPaths,
      });
    } else {
      const imagesPaths = await dbService.getImages(pageNumber, pageLimit);
      return createResponse(200, {
        total: pagesAmount,
        objects: imagesPaths,
      });
    }
  } catch (e) {
    return errorHandler(e);
  }
};

export const getImagesLimit: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const dbService = new DbService();
    await mongoose.connect(mongoUrl!);
    const pageLimit = await dbService.getImagesNumber();
    const limit = JSON.stringify({ limit: pageLimit });
    log('Page limit was sent to the frontend.');
    return createResponse(200, limit);
  } catch (e) {
    return errorHandler(e);
  }
}