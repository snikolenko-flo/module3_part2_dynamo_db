import * as dotenv from 'dotenv';
dotenv.config();
import { Request } from 'express';

const BASE_URL = process.env.BASE_URL;

export class UrlService {
  getUrl(req: Request, base: string): URL {
    return new URL(req.url, base);
  }

  getPageNumber(req: Request): number {
    const url: URL = this.getUrl(req, BASE_URL);
    const page = url.searchParams.get('page');
    return parseInt(page);
  }

  getPageLimit(req: Request): number {
    const url: URL = this.getUrl(req, BASE_URL);
    const limit = url.searchParams.get('limit');
    return parseInt(limit);
  }

  getUser(req: Request): string {
    const url: URL = this.getUrl(req, BASE_URL);
    const user = url.searchParams.get('filter');
    return user;
  }

  getPathFromRequest(req: Request): string {
    return req.files[0].path;
  }
}
