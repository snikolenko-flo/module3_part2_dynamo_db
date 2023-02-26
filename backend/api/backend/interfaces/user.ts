import { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  salt: string;
  images?: Array<Schema.Types.ObjectId>;
}

export interface IResponseWithImages {
  total: number;
  objects: string[];
}
