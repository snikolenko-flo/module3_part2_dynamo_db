import { LoginUser } from './login.user';

export class LoginManager {
  user: LoginUser;

  constructor() {
    this.user = new LoginUser();
  }
}
