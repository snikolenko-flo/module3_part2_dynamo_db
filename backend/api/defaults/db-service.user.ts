import { DynamoUser } from '../backend/interfaces/user';
import { PutItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import util from 'util';
import * as crypto from 'crypto';

export class UserService {
  usersArray: DynamoUser[];
  table: string;
  client: DynamoDBClient;

  constructor(defaultUsersArray: DynamoUser[], dynamoTable: string, dynamoClient: DynamoDBClient) {
    this.usersArray = defaultUsersArray;
    this.table = dynamoTable;
    this.client = dynamoClient;
  }

  async addDefaultUsersToDynamo(): Promise<void> {
    for (const user of this.usersArray) {
      await this.addUser(user, this.table, this.client);
    }
  }

  private async addUser(user: DynamoUser, dynamoTable: string, client: DynamoDBClient): Promise<void> {
    const input = {
      Item: {
        Email: {
          S: user.email,
        },
        ID: {
          S: user.id,
        },
        Type: {
          S: user.type,
        },
        Password: {
          S: await this.hashPassword(user.password, user.salt),
        },
        Salt: {
          S: user.salt,
        },
      },
      TableName: dynamoTable,
    };
    try {
      const command = new PutItemCommand(input);
      await client.send(command);
    } catch (e) {
      throw Error(`Error: ${e} | class: DbService | function: addUser.`);
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const crypt = util.promisify(crypto.pbkdf2);
    const hash = await crypt(password, salt, 1000, 64, 'sha512');
    return hash.toString('hex');
  }
}
