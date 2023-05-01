import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import { LoginManager } from './login.manager';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DbService } from '../services/db-service';
import { AuthService } from '../services/auth';

const secret = process.env.SECRET;

export const login: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const manager = new LoginManager();
    const { email, password } = JSON.parse(event.body!);
    const dbService = new DbService();
    const authService = new AuthService();

    const user = await manager.user.findUser(email, dbService);

    if (!user) return createResponse(401, { errorMessage: 'Email or password are invalid.' });
    log('The user exists.');

    const valid = await manager.user.isValidPassword(user.salt, user.password, password);
    if (!valid) return createResponse(401, { errorMessage: 'Email or password are invalid.' });
    log('The user email and password are valid.');

    const token = authService.createJWTToken(user.email, secret!);
    log('Token is created');
    return createResponse(200, { token });
  } catch (e) {
    return errorHandler(e);
  }
};
