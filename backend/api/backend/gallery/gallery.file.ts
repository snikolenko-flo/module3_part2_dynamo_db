import mongoose from 'mongoose';
import { PER_PAGE } from '../data/constants.js';
import { opendir, stat } from 'fs/promises';
import { Image } from '../models/image.model';

const mongoUrl = process.env.MONGO_URL;

export class GalleryFile {
  async getFilesAmountFromDb(): Promise<number> {
    await mongoose.connect(mongoUrl!);
    const imagesNumber = await Image.countDocuments({}).exec();
    return imagesNumber;
  }

  async getFilesAmount(directory: string, counter?: number): Promise<number> {
    try {
      const dir = await opendir(directory);

      counter = counter || 0;

      for await (const file of dir) {
        if (file.name.startsWith('.')) continue;

        const isDir = await this.isDirectory(directory + '/' + file.name);

        if (isDir) {
          counter = await this.getFilesAmount(directory + '/' + file.name, counter);
        } else {
          counter++;
        }
      }
      return counter;
    } catch (e) {
      throw Error(e);
    }
  }

  async isDirectory(filePath: string): Promise<boolean> {
    const isDir = await stat(filePath);
    return isDir.isDirectory();
  }

  // Returns number of pages for all images.
  async getTotalPages(): Promise<number> {
    const filesAmount = await this.getFilesAmountFromDb();
    const onePage = 1;
    if (filesAmount <= PER_PAGE) return onePage;

    const remainder = filesAmount % PER_PAGE;
    if (remainder === 0) return filesAmount / PER_PAGE;

    return Math.trunc(filesAmount / PER_PAGE) + onePage;
  }

  async getUserPagesNumber(filesNumber: number): Promise<number> {
    const onePage = 1;
    if (filesNumber <= PER_PAGE) return onePage;

    const remainder = filesNumber % PER_PAGE;
    if (remainder === 0) return filesNumber / PER_PAGE;

    return Math.trunc(filesNumber / PER_PAGE) + onePage;
  }

  // Returns number of pages according to the specified limit.
  async getTotalPagesForLimit(limit: number): Promise<number> {
    const filesAmount = limit;

    const onePage = 1;
    if (filesAmount <= PER_PAGE) return onePage;

    const remainder = filesAmount % PER_PAGE;
    if (remainder === 0) return filesAmount / PER_PAGE;

    return Math.trunc(filesAmount / PER_PAGE) + onePage;
  }
}
