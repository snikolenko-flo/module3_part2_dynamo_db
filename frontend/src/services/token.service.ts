import { EXPIRATION_TIME } from '../data/constants.js';
import { RedirectService } from './redirect.service.js';

export class TokenService {
  oneMinuteInMs: number;
  redirect: RedirectService;

  constructor() {
    this.oneMinuteInMs = 60000;
    this.redirect = new RedirectService();
  }

  checkToken(): void {
    this.checkExpireTime();
    this.checkTokenExists();
  }

  setToken(token: string): void {
    this.saveToken(token);
    this.setExpireTime();
  }

  checkExpireTime(): void {
    const timeLeft: number = this.getTimeLeft();
    this.reSetExpireTimer(timeLeft);
  }

  checkTokenExists(): void {
    if (!this.tokenExists()) this.redirect.redirectToLogin();
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  setExpireTime(): void {
    const tokenExpirationTime: number = Date.now() + EXPIRATION_TIME * this.oneMinuteInMs;
    localStorage.setItem('tokenExpireTime', tokenExpirationTime.toString());
  }

  getTimeLeft(): number {
    const currentTime: number = Date.now();
    const tokenExpireTime = Number(localStorage.getItem('tokenExpireTime'));
    return tokenExpireTime - currentTime;
  }

  reSetExpireTimer(timeLeft: number): void {
    setTimeout(() => {
      localStorage.removeItem('token');
    }, timeLeft);
  }

  tokenExists(): string {
    return localStorage.getItem('token');
  }
}
