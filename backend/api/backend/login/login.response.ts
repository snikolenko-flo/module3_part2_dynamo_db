import jwt from 'jsonwebtoken';

export class LoginResponse {
  createJWTToken(user, secret) {
    const body = { _id: user._id, email: user.email };
    return jwt.sign({ user: body }, secret);
  }
}