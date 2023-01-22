import { log } from '../helper/logger.js';
import { Response } from 'express';

export class GalleryError {
  sendIsNanError(res: Response) {
    log.error('The page number is not an integer');
    res.statusCode = 400;
    res.end(JSON.stringify({ message: 'The page number should be an integer' }));
  }

  sendFiniteError(res: Response) {
    log.error('The page number is not a finite integer');
    res.statusCode = 400;
    res.end(JSON.stringify({ message: 'The page number should be a finite integer' }));
  }

  sendWrongPageError(res: Response, total: number) {
    log.error(`Page is greater than 0 or less than ${total + 1}`);
    res.statusCode = 400;
    res.end(JSON.stringify({ message: `Page should be greater than 0 and less than ${total + 1}` }));
  }
}
