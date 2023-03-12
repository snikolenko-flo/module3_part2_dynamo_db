import { BASE_URL } from '../data/constants.js';
import { UrlManipulationService } from '../services/url-manipulation.service.js';
import { GalleryService } from '../gallery/gallery.service.js';
import { ValidationResult } from '../interfaces/validate';
import { TokenResponse } from '../interfaces/token';

const urlService = new UrlManipulationService();
const galleryService = new GalleryService();

export class AuthService {
  async redirectToGallery(): Promise<void> {
    const pageNumber: number = urlService.getPageNumberFromUrl();
    let pageLimit: number = urlService.getPageLimitFromUrl();
    if(!pageLimit) {
      pageLimit = await urlService.fetchLimit();
    }
    galleryService.redirectToPage(pageNumber, pageLimit);
  }

  handleEmailValidation(validatedEmail: ValidationResult, emailError: HTMLFormElement): void {
    if (!validatedEmail.isValid) {
      emailError.innerHTML = 'Email is not valid!';
    } else {
      emailError.innerHTML = '';
    }
  }

  handlePasswordValidation(validatedPassword: ValidationResult, passwordErrorElement: HTMLFormElement): void {
    if (!validatedPassword.isValid) {
      passwordErrorElement.innerHTML = validatedPassword.error;
    } else {
      passwordErrorElement.innerHTML = '';
    }
  }

  validateUserData(email: string, password: string): boolean {
    const validatedEmail: ValidationResult = this.validateEmail(email);
    const validatedPassword: ValidationResult = this.validatePassword(password);

    return validatedEmail.isValid && validatedPassword.isValid;
  }

  async fetchToken(email: string, password: string, action: string): Promise<TokenResponse> {
    const user = {
      email: email,
      password: password,
    };

    const url = `${BASE_URL}/${action}`;

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json'
      },
    });

    const result: TokenResponse = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw Error(result.errorMessage);
    }
  }

  validateEmail(email: string): ValidationResult {
    const userEmail = {
      isValid: false,
    };

    const regexp = /\S+@\S+\.\S+/;
    const isValid: boolean = regexp.test(email);

    if (isValid) {
      userEmail.isValid = true;
    }

    return userEmail;
  }

  validatePassword(p: string): ValidationResult {
    const result = {
      isValid: false,
      error: '',
    };

    result.error = this.checkErrors(p);

    if (!result.error) {
      result.isValid = true;
    }

    return result;
  }

  private checkErrors(password: string): string {
    if (password.length < 8) return 'Your password must be at least 8 characters.';
    if (password.search(/[a-z]/) < 0) return 'Your password must contain at least one lowercase letter.';
    if (password.search(/[A-Z]/) < 0) return 'Your password must contain at least one uppercase letter.';
    if (password.search(/[0-9]/) < 0) return 'Your password must contain at least one digit.';
  }
}
