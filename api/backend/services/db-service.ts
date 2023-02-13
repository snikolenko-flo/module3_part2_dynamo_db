import { IUser } from '../interfaces/user';
import { Image } from '../models/image.model';
import { User } from '../models/user.model';
import { log } from '@helper/logger';
import mongoose from 'mongoose';
import { PER_PAGE } from '../data/constants.js';

const mongoUrl = process.env.MONGO_URL;

export class DbService {
  async uploadImageData(fileMetadata, filePath: string, userEmail: string): Promise<void> {
    await mongoose.connect(mongoUrl!);

    const isImage = await Image.findOne({ path: filePath }).exec();
    if (isImage) return;

    const user = await User.findOne({ email: userEmail }).exec();

    const date = new Date();

    const image = new Image({
      path: filePath,
      metadata: fileMetadata,
      date: date,
      user: user!._id,
    });

    await image.save();
    log(`The image ${filePath} was saved`);
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
    return images.sort((a, b) => a.date - b.date);
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
      log(`${e} | class: ${this.constructor.name} | function: getImages.`);
    }
  }

  private async getImagesOfUser(userEmail: string, limit: number): Promise<object[]> {
    try {
      const user = await User.findOne({ email: userEmail }).exec();
      const images = await Image.find({ user: user!.id }).select(['path', 'date']).sort({ date: -1 }).limit(limit);
      return images;
    } catch (e) {
      log(`${e} | class: ${this.constructor.name} | function: getImagesOfUser.`);
    }
  }

  async getUserImages(page: number, limit: number, userEmail?: string): Promise<string[]> {
    try {
      const images = await this.getImagesOfUser(userEmail!, limit);
      const sortedImages = this.sortImagesFromOldToNew(images);
      const imagesPaths = this.retrieveImagesPaths(sortedImages);

      return this.getImagesPerPage(imagesPaths, page, PER_PAGE);
    } catch (e) {
      log(`${e} | class: ${this.constructor.name} | function: getImages.`);
    }
  }

  async createUser(email: string, password: string, salt: string): Promise<IUser> {
    const user = (await User.create({ email, password, salt })) as IUser;
    return user;
  }
}
