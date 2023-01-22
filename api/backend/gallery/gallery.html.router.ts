import express, { Request, Response } from 'express';
import { FileService } from '../services/file.service.js';
import { log } from '../helper/logger.js';

const fileService = new FileService();

export const galleryHtmlRouter = express.Router();
galleryHtmlRouter.get('/', async (req: Request, res: Response, next) => {
  log.info(`Request "${req.originalUrl}" is got.`);
  try {
    await fileService.sendFile(req, res, './built/frontend/html/gallery.html', 'text/html');
  } catch (e) {
    log.error(`The error ${e} has occurred in ./backend/src/gallery/gallery.html.router.js/galleryHtmlRouter.get('/').`);
    next(e);
  }
});
