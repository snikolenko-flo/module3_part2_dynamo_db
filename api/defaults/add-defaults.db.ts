import { DbService } from './db-service';

const imagesDir = './api/backend/images';
const mongoUrl = 'mongodb://localhost:27017/test';

const dbService = new DbService();

(async () => await dbService.startDb(imagesDir!, mongoUrl!))();
