import { DynamoDBClient, QueryCommand, PutItemCommand, QueryOutput } from '@aws-sdk/client-dynamodb';
import { DynamoUser } from '../interfaces/user';
import { hashPassword } from './helper';
import { v4 as uuidv4 } from 'uuid';

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
    console.log(`email: ${email}`);
    console.log(`table: ${this.table}`);

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
        salt: user.Salt.S!,
        id: user.ID.S!,
        type: user.Type.S!,
        email: user.Email.S!,
        password: user.Password.S!,
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
        ID: {
          S: uuidv4(),
        },
        Type: {
          S: 'user',
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
