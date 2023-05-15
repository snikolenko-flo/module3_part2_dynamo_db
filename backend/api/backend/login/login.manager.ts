import { LoginUser } from './login.user';
import { ImageService } from '../services/db-service.image';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dynamoTable = process.env.DYNAMO_TABLE;
const awsRegion = process.env.AWS_REGION;

const client = new DynamoDBClient({ region: awsRegion });

export class LoginManager {
  user: LoginUser;
  image: ImageService;

  constructor() {
    this.user = new LoginUser();
    this.image = new ImageService(dynamoTable!, client);
  }
}
