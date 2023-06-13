import { IUser } from './user';
import { IResponseWithImages } from './response';
import { ImagesArray } from './image';

export abstract class Database {
  abstract findUser(email: string): Promise<IUser>;
  abstract createUser(email: string, password: string, salt: string): Promise<void>;
  abstract getNumberOfAllImages(user: string): Promise<number>;
  abstract getNumberOfSharedImages(): Promise<number>;
  abstract getNumberOfImagesForUser(userEmail: string, limit: number): Promise<number>;
  abstract getImagesForOnePage(
    page: number,
    limit: number,
    pagesAmount: number,
    currentUser: string
  ): Promise<IResponseWithImages>;
  abstract getImagesForUser(
    page: number,
    limit: number,
    pagesAmount: number,
    userEmail?: string
  ): Promise<IResponseWithImages>;
  abstract getImagesArray(userEmail: string): Promise<ImagesArray>;
  abstract updateUserInDB(userEmail: string, arrayOfImages: ImagesArray): Promise<void>;
  abstract addDefaultUsersToDB(usersArray: IUser[]): Promise<void>;
  abstract addImagesDataToDB(directory: string): Promise<void>;
}
