import { IUser } from '../interfaces/user';
import { Image } from '../models/image.model';
import { User } from '../models/user.model';
import { log } from '@helper/logger';
import mongoose from 'mongoose';
import { PER_PAGE } from '../data/constants.js';
import { IResponseWithImages } from '../interfaces/response';
import { Images } from '../interfaces/image';

const mongoUrl = process.env.MONGO_URL;

export class DbService {
  async uploadImageData(fileMetadata: object, filePath: string, userEmail: string): Promise<void> {
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

  async findUser(email: string): Promise<IUser> {
    return (await User.findOne({ email: email }).select(['email', 'password', 'salt']).exec()) as IUser;
  }

  async getImagesNumber(): Promise<number> {
    return Image.count();
  }

  async getUserImagesNumber(userEmail: string, limit: number): Promise<number> {
    const images = await this.getImagesOfUser(userEmail, limit);
    return images.length;
  }

  private getImagesPerPage(images: string[], page: number, perPage: number): string[] {
    const endIndex = page * perPage;
    const start = endIndex - perPage;
    return images.slice(start, endIndex);
  }

  private sortImagesFromOldToNew(images: Images[]): Images[] {
    return images.sort((a, b) => Number(a.date) - Number(b.date));
  }

  private retrieveImagesPaths(images: Images[]): string[] {
    return images.map((item) => item.path);
  }

  async getImages(page: number, limit: number, pagesAmount: number): Promise<IResponseWithImages> {
    try {
      const images: Images[] = (await Image.find({})
        .select(['path', 'date'])
        .sort({ date: -1 })
        .limit(limit)) as Images[];
      const sortedImages = this.sortImagesFromOldToNew(images);
      const imagesPaths = this.retrieveImagesPaths(sortedImages);

      const paths = this.getImagesPerPage(imagesPaths, page, PER_PAGE);

      return {
        total: pagesAmount,
        objects: paths,
      };
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: getImages.`);
    }
  }

  private async getImagesOfUser(userEmail: string, limit: number): Promise<Images[]> {
    try {
      const user = await User.findOne({ email: userEmail }).exec();
      const images: Images[] = (await Image.find({ user: user!.id })
        .select(['path', 'date'])
        .sort({ date: -1 })
        .limit(limit)) as Images[];
      return images;
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: getImagesOfUser.`);
    }
  }

  async getUserImages(
    page: number,
    limit: number,
    pagesAmount: number,
    userEmail?: string
  ): Promise<IResponseWithImages> {
    try {
      const images = await this.getImagesOfUser(userEmail!, limit);
      const sortedImages = this.sortImagesFromOldToNew(images);
      const imagesPaths = this.retrieveImagesPaths(sortedImages);

      const paths = this.getImagesPerPage(imagesPaths, page, PER_PAGE);

      return {
        total: pagesAmount,
        objects: paths,
      };
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: getImages.`);
    }
  }

  async createUser(email: string, password: string, salt: string): Promise<IUser> {
    return (await User.create({ email, password, salt })) as IUser;
  }
}
