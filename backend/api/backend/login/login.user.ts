// import { createResponse } from '@helper/http-api/response';
// import { log } from '@helper/logger';
import { DbService } from '../services/db-service';

export class LoginUser {
  async findUser(email: string, dbService: DbService) {
    try {
      const user = await dbService.findUser(email);
      return user;
    } catch (e) {
      throw { errorMessage: 'Could not get a user from database.', statusCode: 404 };
    }
  }
  //
  // async getUser(email: string, password: string, dbService: DbService) {
  //   try {
  //     const user = await this.findUser(email, dbService);
  //     if (!user) return createResponse(401, { errorMessage: 'Email or password are invalid.' });
  //     log('The user exists.');
  //
  //     const valid = await user.isValidPassword(password);
  //     if (!valid) return createResponse(401, { errorMessage: 'Email or password are invalid.' });
  //     log('The user email and password are valid.');
  //     return user;
  //   } catch (e) {
  //     throw { errorMessage: 'Could not get a user from database.', statusCode: 404 };
  //   }
  // }
}
