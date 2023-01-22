import { log } from '../helper/logger.js';
import { applyHeaders } from './header.service.js';

const whitelist = [
  'http://127.0.0.1:3000',
  '127.0.0.1:3000',
  'http://localhost:3000',
  'localhost:3000'
];

export function cors(req, res, next) {
  log.info(`Request "${req.originalUrl}" is got.`);
  const origin = req.headers.origin ? req.headers.origin : req.headers.host;

  if(whitelist.indexOf(origin) !== -1) {
    log.info(`Origin ${origin} is in the whitelist.`);
    applyHeaders(req, res, origin);

    if(req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
    } else {
      next();
    }
  } else {
    log.error(`Origin ${origin} is not in the whitelist.`);
    res.statusCode = 401;
    res.end();
  }
}
