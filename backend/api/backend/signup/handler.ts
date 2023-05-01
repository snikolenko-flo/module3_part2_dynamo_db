import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import crypto from 'crypto';
import { SignupManager } from './signup.manager';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DbService } from '../services/db-service';
import { AuthService } from '../services/auth';

const secret = process.env.SECRET;

export const signup: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const manager = new SignupManager();

    const { email, password } = JSON.parse(event.body!);
    const salt = crypto.randomBytes(16).toString('hex');

    const dbService = new DbService();
    const authService = new AuthService();

    await manager.user.createUser(email, password, salt, dbService);
    log(`User ${email} is created`);
    const token = manager.response.getToken(email, secret!, authService);
    log('Token is created');
    return createResponse(200, { token });
  } catch (e) {
    return errorHandler(e);
  }
};
