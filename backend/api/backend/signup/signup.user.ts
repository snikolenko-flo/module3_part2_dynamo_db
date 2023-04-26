import { IUser } from '../interfaces/user';
import { DbService } from '../services/db-service';

export class SignupUser {
  async createUser(email: string, password: string, salt: string, dbService: DbService) {
    try {
      await dbService.createDynamoUser(email, password, salt);
    } catch (e) {
      throw { errorMessage: 'Could not create a new user in database.', statusCode: 400 };
    }
  }
}
