import { DbService } from '../services/db-service';

export class SignupUser {
  async createUser(email: string, password: string, salt: string, dbService: DbService): Promise<void> {
    try {
      await dbService.user.createDynamoUser(email, password, salt);
    } catch (e) {
      throw { errorMessage: 'Could not create a new user in database.', statusCode: 400 };
    }
  }
}
