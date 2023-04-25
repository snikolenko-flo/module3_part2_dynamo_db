import { DbService } from './db-service';

const imagesDir = './api/backend/images';
const dbService = new DbService();

(async () => await dbService.startDb(imagesDir!))();
