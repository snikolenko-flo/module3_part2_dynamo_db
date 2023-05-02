import { DynamoDBClient, QueryCommand, PutItemCommand, QueryOutput } from '@aws-sdk/client-dynamodb';
import { DynamoUser } from '../interfaces/user';
import { hashPassword } from './helper';

export class UserService {
  defaultLimit: number;
  userSortValue: string;
  client: DynamoDBClient;
  table: string;

  constructor(dynamoTable: string, dynamoClient: DynamoDBClient) {
    this.defaultLimit = 60;
    this.userSortValue = 'default';
    this.client = dynamoClient;
    this.table = dynamoTable;
  }

  async findUserInDynamo(email: string): Promise<DynamoUser> {
    const params = {
      TableName: this.table,
      KeyConditionExpression: 'Email = :pk and FileName = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: email },
        ':sk': { S: this.userSortValue },
      },
    };

    const queryCommand = new QueryCommand(params);

    try {
      const data = await this.client.send(queryCommand);
      const user = data.Items![0];

      return {
        salt: user.Salt.S,
        filename: this.userSortValue,
        email: user.Email.S,
        password: user.Password.S,
        path: user.ImagePath.S,
      };
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: findUserInDynamo.`);
    }
  }

  async createDynamoUser(email: string, password: string, salt: string): Promise<void> {
    const input = {
      Item: {
        Email: {
          S: email,
        },
        FileName: {
          S: 'default',
        },
        ImagePath: {
          S: 'default',
        },
        Password: {
          S: await hashPassword(password, salt),
        },
        Salt: {
          S: salt,
        },
      },
      TableName: this.table,
    };
    try {
      const command = new PutItemCommand(input);
      await this.client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: createDynamoUser.`);
    }
  }
}
