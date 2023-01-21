// import { LoginManager } from './login.manager.js';
// import { log } from '../helper/logger.js';
// import { Request, Response } from 'express';
// import { User } from '../models/user.model.js';
//
// const manager = new LoginManager();
//
// export async function login(req: Request, res: Response) {
//   try {
//     const { email, password } = await manager.user.getBody(req);
//     const user = await manager.user.findUser(email);
//
//     if (!user) return manager.error.sendLoginError(res);
//     log.info('The user exists.');
//
//     if (user.password !== password) return manager.error.sendLoginError(res);
//     log.info('The user email and password are valid.');
//
//     manager.response.sendToken(res);
//   } catch (e) {
//     log.error(`${e} | function: login.`);
//   }
// }
//
// export async function signUp(req: Request, res: Response) {
//   try {
//     const { email, password } = await manager.user.getBody(req);
//     console.log(`email: ${email}, password: ${password}`);
//
//     const user = new User({
//       email: email,
//       password: password,
//     });
//     await user.save();
//     log.info(`The user ${email} is added to db.`);
//
//     manager.response.sendToken(res);
//   } catch (e) {
//     log.error(`${e} in backend/src/login/handler/signUp()`);
//   }
// }
