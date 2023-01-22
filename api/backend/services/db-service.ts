import { opendir, stat } from 'node:fs/promises';
import { User } from '../models/user.model.js';
import { Image } from '../models/image.model.js';
import { GalleryFile } from '../gallery/gallery.file.js';
import { log } from '../helper/logger.js';
import mongoose from 'mongoose';
import { FileSystemService } from './file.system.service.js';
import { PER_PAGE } from '../data/constants.js';
import crypto from 'node:crypto';

const galleryService = new GalleryFile();
const fsService = new FileSystemService();

export class DbService {
  async uploadImageData(filePath: string, userEmail: string): Promise<void> {

    const fileMetadata = await fsService.getFileMetadata(filePath);
    const pathWithoutBuiltFolder = fsService.removeFirstDirFromPath(filePath);

    const isImage = await Image.findOne({ path: pathWithoutBuiltFolder }).exec();
    if (isImage) return;

    const user = await User.findOne({ 'email': userEmail }).exec();
    const date = new Date();

    const image = new Image({
      path: pathWithoutBuiltFolder,
      metadata: fileMetadata,
      date: date,
      user: user._id
    });

    await image.save();
    log.info(`The image ${filePath} was saved`);
  }

  async addImagesData(directory: string): Promise<void> {
    try {
      const dir = await opendir(directory);

      for await (const file of dir) {
        try {
          if (file.name.startsWith('.')) continue;

          const filePath = directory + '/' + file.name;
          const isDir = await galleryService.isDirectory(filePath);

          if (isDir) {
            await this.addImagesData(filePath);
          } else {
            const fileStat = await stat(filePath);
            const pathWithoutBuiltFolder = fsService.getPathWithoutBuiltFolder(directory, file.name);
            const isImage = await Image.findOne({ path: pathWithoutBuiltFolder }).exec();

            if (isImage) return;

            const date = new Date();
            const image = new Image({
              path: pathWithoutBuiltFolder,
              metadata: fileStat,
              date: date
            });
            await image.save();
          }
        } catch (e){
          log.error(`${e} | class: ${this.constructor.name} | function: addImagesData.`);
        }
      }
    } catch (e) {
      log.error(`${e} | class: ${this.constructor.name} | function: addImagesData.`);
    }
  }

  async addDefaultUsers(): Promise<void> {
    const defaultUsersArray = ['asergeev@flo.team', 'tpupkin@flo.team', 'vkotikov@flo.team'];

    try {
      const records = await User.find({ 'email': { $in: defaultUsersArray } });
      if (records.length) return;

      const asergeev = new User({
        email: 'asergeev@flo.team',
        password: 'jgF5tn4F',
        salt: crypto.randomBytes(16).toString('hex')
      });
      await asergeev.save();
      log.info(`The user ${asergeev.email} was saved to DB.`);

      const tpupkin = new User({
        email: 'tpupkin@flo.team',
        password: 'tpupkin@flo.team',
        salt: crypto.randomBytes(16).toString('hex')
      });
      await tpupkin.save();
      log.info(`The user ${tpupkin.email} was saved to DB.`);

      const vkotikov = new User({
        email: 'vkotikov@flo.team',
        password: 'po3FGas8',
        salt: crypto.randomBytes(16).toString('hex')
      });
      await vkotikov.save();
      log.info(`The user ${vkotikov.email} was saved to DB.`);
    } catch (e) {
      log.error(`${e} | class: ${this.constructor.name} | function: addDefaultUsers.`);
    }
  }

  async findUser(email: string) {
    const user = await User.findOne({ email: email }).select(['email', 'password', 'salt']).exec();
    return user;
  }

  async getImagesNumber(): Promise<number> {
    const imagesNumber = await Image.count();
    return imagesNumber;
  }

  async getUserImagesNumber(userEmail: string, limit: number): Promise<number> {
    const images = await this.getImagesOfUser(userEmail, limit);
    return images.length;
  }

  private async getImagesPerPage(images: string[], page: number, perPage: number): Promise<string[]> {
    const endIndex = page * perPage;
    const start = endIndex - perPage;
    return images.slice(start, endIndex);
  }

  private sortImagesFromOldToNew(images): object[] {
    return images.sort((a,b) => a.date - b.date);
  }

  private retrieveImagesPaths(images): string[] {
    return images.map((item) => item.path);
  }

  async getImages(page: number, limit: number): Promise<string[]> {
    try {

      const images = await Image.find({}).select(['path', 'date']).sort({date: -1}).limit(limit);

      const sortedImages = this.sortImagesFromOldToNew(images);
      const imagesPaths = this.retrieveImagesPaths(sortedImages);

      return this.getImagesPerPage(imagesPaths, page, PER_PAGE);
    } catch (e) {
      log.error(`${e} | class: ${this.constructor.name} | function: getImages.`);
    }
  }

  private async getImagesOfUser(userEmail: string, limit: number): Promise<object[]> {
    try {
      const user = await User.findOne({ 'email': userEmail }).exec();
      const images = await Image.find({ user: user.id }).select(['path', 'date']).sort({date: -1}).limit(limit);
      return images;
    } catch(e) {
      log.error(`${e} | class: ${this.constructor.name} | function: getImagesOfUser.`);
    }
  }

  async getUserImages(page: number, limit: number, userEmail?: string): Promise<string[]> {
    try {
      const images = await this.getImagesOfUser(userEmail, limit);
      const sortedImages = this.sortImagesFromOldToNew(images);
      const imagesPaths = this.retrieveImagesPaths(sortedImages);

      return this.getImagesPerPage(imagesPaths, page, PER_PAGE);
    } catch (e) {
      log.error(`${e} | class: ${this.constructor.name} | function: getImages.`);
    }
  }

  private async connectToDb(mongoUrl: string): Promise<void> {
    try {
      await mongoose.connect(mongoUrl);
      log.info(`Database is running at ${mongoUrl}`);
    } catch (e) {
      log.error(`${e} | class: ${this.constructor.name} | function: connectToDb.`);
    }
  }

  private async addDefaultUsersToDB(): Promise<void> {
    try {
      await this.addDefaultUsers();
      log.info('Default users have been added to DB.');
    } catch (e) {
      log.error(`${e} | class: ${this.constructor.name} | function: addDefaultUsersToDB.`);
    }
  }

  private async addImagesDataToDB(imagesDir: string): Promise<void> {
    try {
      await this.addImagesData(imagesDir);
      log.info('Images have been added to DB.');
    } catch (e) {
      log.error(`${e} | class: ${this.constructor.name} | function: addImagesDataToDB.`);
    }
  }

  async startDb(imagesDir: string, mongoUrl: string): Promise<void> {
    await this.connectToDb(mongoUrl);
    await this.addDefaultUsersToDB();
    await this.addImagesDataToDB(imagesDir);
  }
}
