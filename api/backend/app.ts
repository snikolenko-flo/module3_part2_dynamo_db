// import * as dotenv from 'dotenv';
// import express from 'express';
// import { loginRouter, signUpRouter } from './login/router.js';
// import { galleryRouter } from './gallery/router.js';
// import { galleryHtmlRouter } from './gallery/gallery.html.router.js';
// import { DbService } from './services/db-service.js';
// import { ErrorService } from './services/error.service.js';
// import './login/auth.js';
// import passport from 'passport';
// import { cors } from './services/cors.js';
//
// dotenv.config();
// const imagesDir = process.env.IMAGES_DIR;
// const mongoUrl = process.env.MONGO_URL;
// const hostname = process.env.HOST;
// const port = process.env.PORT;
//
// const errorService = new ErrorService();
// const dbService = new DbService();
//
// dbService.startDb(imagesDir, mongoUrl);
//
// const app = express();
//
// app.use(express.json());
// app.use(express.static('built'));
// app.use('/', cors, loginRouter);
// app.use('/signup', cors, signUpRouter);
// app.use('/login', cors, loginRouter);
// app.use('/gallery.html', cors, galleryHtmlRouter);
// app.use('/gallery', cors, passport.authenticate('jwt', { session: false }), galleryRouter);
// app.use('/upload', cors, passport.authenticate('jwt', { session: false }), galleryRouter);
// app.use(errorService.defaultHandler);
//
// app.listen(port, hostname, () => {
//   console.log(`Server is running at http://${hostname}:${port}/`);
// });
