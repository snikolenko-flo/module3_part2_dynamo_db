import jwt from 'jsonwebtoken';

export class AuthService {
  createJWTToken(user, secret: string): string {
    const body = { _id: user._id, email: user.email };
    return jwt.sign({ user: body }, secret);
  }
}
