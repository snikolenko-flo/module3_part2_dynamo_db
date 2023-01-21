// import { User } from '../interfaces/user.js';
// import { Request } from 'express';
// import { DbService } from '../services/db-service.js';
// import { log } from '../helper/logger.js';
//
// const dbService = new DbService();
//
// export class LoginUser {
//   async getBody(req: Request): Promise<User> {
//     try {
//       let body = '';
//       await req.on('data', (chunk) => {
//         body += chunk.toString();
//       });
//       return JSON.parse(body);
//     } catch (e) {
//       log.error(`${e} in backend/src/login/login.user.ts/LoginUser/getBody()`);
//     }
//   }
//
//   async findUser(email: string) {
//     const user = await dbService.findUser(email);
//     return user;
//   }
// }
