import { DynamoDB } from '../backend/services/dynamo.service';
import { defaultUsersArray } from './default.users';

const imagesDir = './api/backend/images';
const dbService = new DynamoDB();

(async () => {
  await dbService.addDefaultUsersToDB(defaultUsersArray);
  await dbService.addImagesDataToDB(imagesDir);
})();
