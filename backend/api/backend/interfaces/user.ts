import { ImagesArray } from './image';

export interface IUser {
  email: string;
  password: string;
  salt: string;
  images?: ImagesArray;
}
