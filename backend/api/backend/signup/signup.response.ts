import { IUser } from '../interfaces/user';
import { AuthService } from '../services/auth';

export class SignupResponse {
  getToken(user: IUser, secret: string, authService: AuthService): string {
    return authService.createJWTToken(user, secret);
  }
}
