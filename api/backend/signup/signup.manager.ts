import { SignupResponse } from './signup.response';
//import { LoginError } from './login.error';
import { SignupUser } from './signup.user';

export class SignupManager {
  response: SignupResponse;
  //error: LoginError;
  user: SignupUser;

  constructor() {
    this.response = new SignupResponse();
    //this.error = new LoginError();
    this.user = new SignupUser();
  }
}