import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import { GalleryFile } from './gallery.file.js';

export class GalleryManager {
  file: GalleryFile;

  constructor() {
    this.file = new GalleryFile();
  }
  async getGallery(user, pageNumber, pageLimit, dbService) {
    let total = await this.file.getTotalPages();
    if (user) {
      const userImagesNumber = await dbService.getUserImagesNumber(user, pageLimit);
      total = await this.file.getUserPagesNumber(userImagesNumber);
    }

    const totalForLimit = await this.file.getTotalPagesForLimit(pageLimit);

    if (pageNumber > total || pageNumber <= 0)
      return createResponse(400, { message: `Page should be Ggreater than 0 and less than ${total + 1}` });
    log(`The page number ${pageNumber} is ok.`);

    if (pageNumber > totalForLimit || pageNumber <= 0)
      return createResponse(400, { message: `Page should be Ggreater than 0 and less than ${totalForLimit + 1}` });
    log(`The page number ${pageNumber} is ok.`);

    let pagesAmount = await this.file.getPagesAmount(pageLimit);
    if (pagesAmount > total) pagesAmount = total;

    if (user) {
      log(`A user ${user} was specified.`);
      const imagesPaths = await dbService.getUserImages(pageNumber, pageLimit, user);
      log(`Got images for user ${user}.`);

      return {
        total: pagesAmount,
        objects: imagesPaths,
      };
    } else {
      const imagesPaths = await dbService.getImages(pageNumber, pageLimit);
      return {
        total: pagesAmount,
        objects: imagesPaths,
      };
    }
  }
}
