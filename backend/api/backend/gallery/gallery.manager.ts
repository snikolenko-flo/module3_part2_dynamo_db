import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import { GalleryFile } from './gallery.file.js';
import { DbService } from '../services/db-service';

export class GalleryManager {
  file: GalleryFile;

  constructor() {
    this.file = new GalleryFile();
  }

  async getGallery(
    user: string,
    pageNumber: number,
    pageLimit: number,
    dbService: DbService,
    currentUser: string
  ): Promise<APIGatewayProxyResult> {
    const pagesAmount = await this.file.getNumberOfPages(pageLimit, dbService, user);
    const isValid = this.file.isPagesAmountValid(pagesAmount, pageNumber);
    if (!isValid) {
      return createResponse(400, {
        message: `Page number should be greater than 0 and less than ${pagesAmount + 1}`,
      });
    }
    const images = await this.file.getImages(pageNumber, pageLimit, pagesAmount, dbService, currentUser, user);
    return createResponse(200, images);
  }
}
