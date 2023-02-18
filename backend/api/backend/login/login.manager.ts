import { LoginResponse } from './login.response';
import { LoginUser } from './login.user';

export class LoginManager {
  response: LoginResponse;
  user: LoginUser;

  constructor() {
    this.response = new LoginResponse();
    this.user = new LoginUser();
  }
}
