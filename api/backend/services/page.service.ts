import { Request, Response } from 'express';
import { log } from '../helper/logger.js';
import { DbService } from './db-service.js';

const dbService = new DbService();

export class PageService {
  async getLimit(req: Request, res: Response): Promise<void> {
    const pageLimit = await dbService.getImagesNumber();
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        limit: pageLimit,
      }),
    );
    log.info('Page limit was sent to the frontend.');
  }
}
