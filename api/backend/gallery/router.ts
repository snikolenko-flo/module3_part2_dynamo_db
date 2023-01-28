// import { getGallery } from './old_handler.js';
// import express, { Request, Response } from 'express';
// import { log } from '../helper/logger.js';
// import { FileService } from '../services/file.service.js';
// import { upload } from '../services/upload.service.js';
// import { PageService } from '../services/page.service.js';
// import { DbService } from '../services/db-service.js';
// import { UrlService } from '../services/url.service.js';
//
// const fileService = new FileService();
// const pageService = new PageService();
// const dbService = new DbService();
// const urlService = new UrlService();
//
// export const galleryRouter = express.Router();
//
// galleryRouter.get('/', async(req, res, next) => {
//   log.info(`Request "${req.originalUrl}" is got.`);
//   try {
//     await getGallery(req, res);
//   } catch (e) {
//     log.error(`The error ${e} has happened in ./backend/src/gallery/router.js/galleryRouter.get('/')`);
//     next(e);
//   }
// });
//
// galleryRouter.get('/limit', async(req, res, next) => {
//   log.info(`Request "${req.originalUrl}" is got.`);
//   try {
//     await pageService.getLimit(req, res);
//   } catch (e) {
//     log.error(`The error ${e} has happened in ./backend/src/gallery/router.js/galleryRouter.get('/limit')`);
//     next(e);
//   }
// });
//
// galleryRouter.post('/', upload.any('img'), async(req: Request, res: Response, next): Promise<void> => {
//   log.info(`Request "${req.originalUrl}" is got.`);
//   try {
//     const files = req.files;
//     if (!files) {
//       res.status = 400;
//       res.send({error: 'Upload a file please'});
//       res.end();
//       log.error('File was not provided.');
//       return;
//     }
//     const filePath = urlService.getPathFromRequest(req);
//     await dbService.uploadImageData(filePath, req.user.email);
//     await fileService.sendFile(req, res, './built/frontend/html/gallery.html', 'text/html');
//     log.info('A new image was uploaded to the server.');
//   } catch (e) {
//     log.error(`The error ${e} has happened in ./backend/src/gallery/router.js/galleryRouter.post('/')`);
//     next(e);
//   }
// });
