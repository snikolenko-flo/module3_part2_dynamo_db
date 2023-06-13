import { DynamoDB } from '../backend/services/dynamo.service';
import { defaultUsersArray } from './default.users';
import { Database } from '../backend/interfaces/database';

const imagesDir = './api/backend/images';
const dbService: Database = new DynamoDB();

(async () => {
  await dbService.addDefaultUsersToDB(defaultUsersArray);
  await dbService.addImagesDataToDB(imagesDir);
})();
