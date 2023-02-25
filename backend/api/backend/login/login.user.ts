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
}
