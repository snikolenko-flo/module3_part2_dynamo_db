export class SignupUser {
  async createUser(email: string, password: string, salt: string, dbService: any): Promise<void> {
    try {
      await dbService.createUser(email, password, salt);
    } catch (e) {
      throw { errorMessage: 'Could not create a new user in database.', statusCode: 400 };
    }
  }
}
