import mongoose from 'mongoose';
import { PER_PAGE } from '../data/constants.js';
import { opendir, stat } from 'node:fs/promises';
import { Image } from '../models/image.model';

const mongoUrl = process.env.MONGO_URL;

export class GalleryFile {
  async getFilesAmountFromDb() {
    await mongoose.connect(mongoUrl!);
    const imagesNumber = await Image.countDocuments({}).exec();
    return imagesNumber;
    console.log(`GalleryFile | getFilesAmountFromDb | imagesNumber: ${imagesNumber}`);
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
    } catch (err) {
      console.error(err);
    }
  }

  async isDirectory(filePath: string): Promise<boolean> {
    const isDir = await stat(filePath);
    return isDir.isDirectory();
  }

  async getTotalPages(): Promise<number> {
    const filesAmount = await this.getFilesAmountFromDb();
    const onePage = 1;
    if (filesAmount <= PER_PAGE) return onePage;

    const remainder = filesAmount % PER_PAGE;
    if (remainder === 0) return filesAmount / PER_PAGE;

    return Math.trunc(filesAmount / PER_PAGE) + onePage;
  }

  async getUserPagesNumber(dir: string, filesNumber: number): Promise<number> {
    const onePage = 1;
    if (filesNumber <= PER_PAGE) return onePage;

    const remainder = filesNumber % PER_PAGE;
    if (remainder === 0) return filesNumber / PER_PAGE;

    return Math.trunc(filesNumber / PER_PAGE) + onePage;
  }

  async getTotalPagesForLimit(limit: number): Promise<number> {
    const filesAmount = limit;

    const onePage = 1;
    if (filesAmount <= PER_PAGE) return onePage;

    const remainder = filesAmount % PER_PAGE;
    if (remainder === 0) return filesAmount / PER_PAGE;

    return Math.trunc(filesAmount / PER_PAGE) + onePage;
  }

  async getPagesAmount(dir: string, limit: number): Promise<number> {
    const filesAmount = limit;

    const onePage = 1;
    if (filesAmount <= PER_PAGE) return onePage;

    const remainder = filesAmount % PER_PAGE;
    if (remainder === 0) return filesAmount / PER_PAGE;

    return Math.trunc(filesAmount / PER_PAGE) + onePage;
  }
}
