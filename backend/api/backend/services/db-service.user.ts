import { DynamoDBClient, QueryCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
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
      KeyConditionExpression: 'Email = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: email },
      },
    };

    const queryCommand = new QueryCommand(params);

    try {
      const data = await this.client.send(queryCommand);
      const user = data.Items![0];

      return {
        email: user.Email.S!,
        password: user.Password.S!,
        salt: user.Salt.S!,
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
      throw Error(`Error: ${e} | class: DbService | function: addUser.`);
    }
  }
}
