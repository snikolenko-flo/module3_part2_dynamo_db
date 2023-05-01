import { DbService } from '../services/db-service';
import crypto from 'crypto';
import util from 'util';
import { DynamoUser } from '../interfaces/user';

export class LoginUser {
  async findUser(email: string, dbService: DbService): Promise<DynamoUser> {
    try {
      return await dbService.findUserInDynamo(email);
    } catch (e) {
      throw { errorMessage: 'Could not get a user from database.', statusCode: 404 };
    }
  }

  isValidPassword = async function (salt: string, userPassword: string, password: string): Promise<boolean> {
    const crypt = util.promisify(crypto.pbkdf2);
    const hash = await crypt(password, salt, 1000, 64, 'sha512');
    return userPassword === hash.toString('hex');
  };
}
