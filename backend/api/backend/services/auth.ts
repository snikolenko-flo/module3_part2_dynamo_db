import jwt from 'jsonwebtoken';
import { IUser } from '../interfaces/user';

export class AuthService {
  createJWTToken(user, secret: string): string {
    const body = { _id: user._id, email: user.email };
    return jwt.sign({ user: body }, secret);
  }
}
