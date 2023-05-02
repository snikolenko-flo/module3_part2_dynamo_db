import { FileService } from '../backend/services/file.service';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { defaultUsersArray } from './default.users';
import { UserService } from './db-service.user';
import { ImageService } from './db-service.image';

const defaultImagesType = 'image/jpeg';
const s3ImagesDirectory = 's3-bucket';
const bucket = 'stanislav-flo-test-bucket';
const dynamoTable = 'module3_part2';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });
const fileService = new FileService();

export class DbService {
  user: UserService;
  image: ImageService;

  constructor() {
    this.user = new UserService(defaultUsersArray, dynamoTable, client);
    this.image = new ImageService(defaultImagesType, s3ImagesDirectory, bucket, dynamoTable, client, fileService);
  }

  async startDb(imagesDir: string): Promise<void> {
    await this.user.addDefaultUsersToDynamo();
    await this.image.addImagesDataToDynamo(imagesDir);
  }
}
