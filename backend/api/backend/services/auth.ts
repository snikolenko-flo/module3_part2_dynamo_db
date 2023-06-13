import jwt from 'jsonwebtoken';

export class AuthService {
  createJWTToken(email: string, secret: string): string {
    return jwt.sign({ user: email }, secret);
  }
}
