import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { User } from '../models/user.model';
import { SignupManager } from './signup.manager';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DbService } from '../services/db-service';
import { AuthService } from '../services/auth';

const secret = process.env.SECRET;
const mongoUrl = process.env.MONGO_URL;

export const signup: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log('singup is triggered');
    const manager = new SignupManager();

    const { email, password } = JSON.parse(event.body!);
    const salt = crypto.randomBytes(16).toString('hex');
    await mongoose.connect(mongoUrl!);

    const dbService = new DbService();
    const authService = new AuthService();

    //const user = await User.create({ email, password, salt });

    const user = await manager.user.createUser(email, password, salt, dbService);
    console.log(`user in signup/handler: ${user}`);
    const token = await manager.response.getToken(user, secret, authService);
    log('Token is created');
    return createResponse(200, { token });
  } catch (e) {
    return errorHandler(e);
  }
};