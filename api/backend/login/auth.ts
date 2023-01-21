// import passport from 'passport';
// import { User } from '../models/user.model.js';
// import * as JWTstrategy from 'passport-jwt';
// import * as ExtractJWT from 'passport-jwt';
// import * as LocalStrategy from 'passport-local';
// import crypto from 'node:crypto';
// import * as dotenv from 'dotenv';
// dotenv.config();
//
// const secret = process.env.SECRET;
//
// passport.use(
//   'signup',
//   new LocalStrategy.Strategy(
//     {
//       usernameField: 'email',
//       passwordField: 'password'
//     },
//     async (email, password, done) => {
//       try {
//         const salt = crypto.randomBytes(16).toString('hex');
//         const user = await User.create({ email, password, salt });
//
//         return done(null, user);
//       } catch (error) {
//         done(error);
//       }
//     }
//   )
// );
//
// passport.use(
//   'login',
//   new LocalStrategy.Strategy(
//     {
//       usernameField: 'email',
//       passwordField: 'password'
//     },
//     async (email, password, done) => {
//       try {
//         const user = await User.findOne({ email });
//
//         if (!user) {
//           return done(null, false, { message: 'User not found' });
//         }
//
//         const validate = await user.isValidPassword(password);
//
//         if (!validate) {
//           return done(null, false, { message: 'Wrong Password' });
//         }
//
//         return done(null, user, { message: 'Logged in Successfully' });
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );
//
// passport.use(
//   new JWTstrategy.Strategy(
//     {
//       secretOrKey: secret,
//       jwtFromRequest: ExtractJWT.ExtractJwt.fromHeader('authorization')
//     },
//     async (payload, done) => {
//       try {
//         return done(null, payload.user);
//       } catch (error) {
//         done(error);
//       }
//     }
//   )
// );
