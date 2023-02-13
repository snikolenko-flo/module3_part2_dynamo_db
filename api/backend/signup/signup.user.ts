import { DbService } from '../services/db-service';

export class SignupUser {
  async createUser(email: string, password: string, salt: string, dbService: DbService) {
    try {
      const user = await dbService.createUser(email, password, salt);
      return user;
    } catch (e) {
      throw { errorMessage: 'Could not create a new user in database.', statusCode: 400 };
    }
  }
}
