import { LoginResponse } from './login.response';
//import { LoginError } from './login.error';
import { LoginUser } from './login.user';

export class LoginManager {
  response: LoginResponse;
  //error: LoginError;
  user: LoginUser;

  constructor() {
    this.response = new LoginResponse();
    //this.error = new LoginError();
    this.user = new LoginUser();
  }
}
