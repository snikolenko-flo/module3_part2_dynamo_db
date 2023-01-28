import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import mongoose from 'mongoose';
import { LoginManager } from './login.manager';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DbService } from '../services/db-service';

const secret = process.env.SECRET;
const mongoUrl = process.env.MONGO_URL;

export const login: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const manager = new LoginManager();
    const { email, password } = JSON.parse(event.body!);

    const dbService = new DbService();
    await mongoose.connect(mongoUrl!);

    const user = await manager.user.getUser(email, password, dbService);
    const token = await manager.response.createJWTToken(user, secret);
    log('Token is created');
    return createResponse(200, { token });
  } catch (e) {
    return errorHandler(e);
  }
};

// export const simpleAuthorizer = async (event) => {
//   log(event);
//   try {
//     console.log('authorize the user');
//     return {
//       isAuthorized: true,
//       context: {
//         var1: 'v1',
//       },
//     };
//     //return createResponse(200);
//   } catch (e) {
//     return errorHandler(e);
//   }
// };
