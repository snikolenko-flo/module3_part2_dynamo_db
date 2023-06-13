import crypto from 'crypto';
import util from 'util';
import { IUser } from '../interfaces/user';
import { Database } from '../interfaces/database';

export class LoginManager {
  async findUser(email: string, dbService: Database): Promise<IUser> {
    try {
      return await dbService.findUser(email);
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
