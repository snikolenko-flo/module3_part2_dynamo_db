import { AuthService } from './auth.service.js';
import { TokenService } from '../services/token.service.js';
import { ValidationResult } from '../interfaces/validate';
import { TokenResponse } from '../interfaces/token';
import { User } from '../interfaces/user';

const tokenService = new TokenService();

export class AuthManager {
  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  checkEmail(email: string, emailErrorElement: HTMLFormElement): void {
    const validatedEmail: ValidationResult = this.authService.validateEmail(email);
    this.authService.handleEmailValidation(validatedEmail, emailErrorElement);
  }

  checkPassword(password: string, passwordErrorElement: HTMLFormElement): void {
    const validatedPassword: ValidationResult = this.authService.validatePassword(password);
    this.authService.handlePasswordValidation(validatedPassword, passwordErrorElement);
  }

  isUserDataValid(email: string, password: string): boolean {
    return this.authService.validateUserData(email, password);
  }

  async authUser(email: string, password: string, action: string): Promise<void> {
    try {
      if (!this.isUserDataValid(email, password)) return;
      const result: TokenResponse = await this.authService.fetchToken(email, password, action);
      tokenService.setToken(result.token);
      await this.authService.redirectToGallery();
    } catch (e) {
      alert(e);
    }
  }

  async getCredentialsFromEvent(event: Event): Promise<User> {
    const email: string = (event.target as HTMLFormElement).email.value;
    const password: string = (event.target as HTMLFormElement).password.value;
    return {
      email: email,
      password: password
    };
  }
}
