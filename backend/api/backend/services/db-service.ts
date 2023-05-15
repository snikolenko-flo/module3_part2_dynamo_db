import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UserService } from './db-service.user';
import { ImageService } from './db-service.image';

const dynamoTable = process.env.DYNAMO_TABLE;
const awsRegion = process.env.AWS_REGION;

const client = new DynamoDBClient({ region: awsRegion });

export class DbService {
  user: UserService;
  image: ImageService;

  constructor() {
    this.user = new UserService(dynamoTable!, client);
    this.image = new ImageService(dynamoTable!, client);
  }
}
