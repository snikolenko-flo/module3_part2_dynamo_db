import { log } from '@helper/logger';
import mongoose from 'mongoose';
import { PER_PAGE } from '../data/constants.js';
import { opendir, stat } from 'fs/promises';
import { Image } from '../models/image.model';
import { DbService } from '../services/db-service';
import { IResponseWithImages } from '../interfaces/response';
import { getFilesAmountFromDynamoDB } from '../services/db-service';

const mongoUrl = process.env.MONGO_URL;

export class GalleryFile {
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

  isPagesAmountValid(pagesAmount: number, pageNumber: number): boolean {
    if (pageNumber > pagesAmount || pageNumber <= 0) {
      log(`The page number ${pageNumber} is wrong.`);
      return false;
    } else {
      return true;
    }
  }

  async getImages(
    pageNumber: number,
    pageLimit: number,
    pagesAmount: number,
    dbService: DbService,
    currentUser: string,
    user?: string,
  ): Promise<IResponseWithImages> {
    if (user) {
      log(`Get images for the user ${user}.`);
      return await dbService.getUserImages(pageNumber, pageLimit, pagesAmount, user);
    } else {
      log('Get all images.');
      return await dbService.getImagesFromDynamo(pageNumber, pageLimit, pagesAmount, currentUser);
    }
  }

  async getNumberOfPages(limit: number, dbService: DbService, user?: string): Promise<number> {
    if (user) {
      const userImagesNumber = await dbService.getUserImagesNumber(user, limit);
      return this.getNumberOfPagesForUser(userImagesNumber);
    }

    const total = await getFilesAmountFromDynamoDB();
    const totalPages = this.calculatePagesNumber(total);

    if (limit) {
      const pagesAmount = this.calculatePagesNumber(limit);
      if (pagesAmount > totalPages) {
        return totalPages;
      } else {
        return pagesAmount;
      }
    }
    return totalPages;
  }

  getNumberOfPagesForUser(filesNumber: number): number {
    return this.calculatePagesNumber(filesNumber);
  }

  private calculatePagesNumber(filesAmount) {
    const onePage = 1;
    if (filesAmount <= PER_PAGE) return onePage;

    const remainder = filesAmount % PER_PAGE;
    if (remainder === 0) return filesAmount / PER_PAGE;

    return Math.trunc(filesAmount / PER_PAGE) + onePage;
  }
}
