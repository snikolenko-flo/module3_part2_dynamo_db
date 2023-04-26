import jwt from 'jsonwebtoken';

export class AuthService {
  createJWTToken(email, secret: string): string {
    //const body = { user: email };
    return jwt.sign({ user: email }, secret);
  }
}
