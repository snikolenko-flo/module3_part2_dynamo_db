import { log } from '../helper/logger.js';
import { Response } from 'express';

export class GalleryResponse {
  sendImages(res: Response, total: number, paths: string[]) {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        total: total,
        objects: paths,
      }),
    );
    log.info('Images were sent to the frontend.');
  }
}
