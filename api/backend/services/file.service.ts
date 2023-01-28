// import fs from 'fs';
// import { log } from '../helper/logger.js';
// import { Request, Response } from 'express';
//
// export class FileService {
//   async sendFile(req: Request, res: Response, path: string, contentType: string): Promise<void> {
//     try {
//       fs.readFile(path, function (err, data) {
//         if (err) {
//           log.error('Requested file was not found.');
//           res.writeHead(404);
//           res.end(JSON.stringify(err));
//           return;
//         }
//         log.info(`The file "${path}" was sent to the frontend.`);
//         res.setHeader('Content-Type', contentType);
//         res.writeHead(200);
//         res.end(data);
//       });
//     } catch (e) {
//       log.error(`The error ${e} has happened in function backend/src/services/file.services.ts/FileService/sendFile()`);
//     }
//
//   }
// }
