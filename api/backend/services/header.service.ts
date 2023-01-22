import { Request, Response } from 'express';

export function applyHeaders(req: Request, res: Response, origin) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
}
