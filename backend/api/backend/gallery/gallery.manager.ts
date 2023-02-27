import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import { GalleryFile } from './gallery.file.js';
import { DbService } from '../services/db-service';

export class GalleryManager {
  file: GalleryFile;

  constructor() {
    this.file = new GalleryFile();
  }
  async getGallery(user: string, pageNumber: number, pageLimit: number, dbService: DbService) {
    let total = await this.file.getTotalPages();
    if (user) {
      const userImagesNumber = await dbService.getUserImagesNumber(user, pageLimit);
      total = await this.file.getUserPagesNumber(userImagesNumber);
    }

    const totalForLimit = await this.file.getTotalPagesForLimit(pageLimit);

    if (pageNumber > total || pageNumber <= 0) {
      log(`The page number ${pageNumber} is wrong.`);
      return createResponse(400, { message: `Page should be Greater than 0 and less than ${total + 1}` });
    }
    if (pageNumber > totalForLimit || pageNumber <= 0) {
      log(`The page number ${pageNumber} is wrong.`);
      return createResponse(400, { message: `Page should be Greater than 0 and less than ${totalForLimit + 1}` });
    }

    let pagesAmount = await this.file.getPagesAmount(pageLimit);
    if (pagesAmount > total) pagesAmount = total;

    if (user) {
      log(`A user ${user} was specified.`);
      const images = await dbService.getUserImages(pageNumber, pageLimit, pagesAmount, user);
      log(`Got images for the user ${user}.`);
      //return images;
      return createResponse(200, images);
    } else {
      const images = await dbService.getImages(pageNumber, pageLimit, pagesAmount);
      //return images;
      return createResponse(200, images);
    }
  }
}
