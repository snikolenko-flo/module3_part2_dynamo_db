import { AuthService } from '../services/auth';

export class SignupResponse {
  getToken(user, secret: string, authService: AuthService): string {
    return authService.createJWTToken(user, secret);
  }
}
