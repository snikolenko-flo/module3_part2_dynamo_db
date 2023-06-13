import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import { GalleryService } from './gallery.service.js';
import { Database } from '../interfaces/database.js';

export class GalleryManager {
  service: GalleryService;

  constructor() {
    this.service = new GalleryService();
  }

  async getGallery(
    user: string,
    pageNumber: number,
    pageLimit: number,
    dbService: Database,
    currentUser: string
  ): Promise<APIGatewayProxyResult> {
    const pagesAmount = await this.service.getNumberOfPages(pageLimit, dbService, user);
    const isValid = this.service.isPagesAmountValid(pagesAmount, pageNumber);
    if (!isValid) {
      return createResponse(400, {
        message: `Page number should be greater than 0 and less than ${pagesAmount + 1}`,
      });
    }
    const images = await this.service.getImages(pageNumber, pageLimit, pagesAmount, dbService, currentUser, user);
    return createResponse(200, images);
  }
}
