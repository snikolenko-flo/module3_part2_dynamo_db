import { SignupResponse } from './signup.response';
import { SignupUser } from './signup.user';

export class SignupManager {
  response: SignupResponse;
  user: SignupUser;

  constructor() {
    this.response = new SignupResponse();
    this.user = new SignupUser();
  }
}
