import { AuthService } from '../services/auth';

export class SignupResponse {
  getToken(user, secret, authService: AuthService) {
    return authService.createJWTToken(user, secret);
  }
}