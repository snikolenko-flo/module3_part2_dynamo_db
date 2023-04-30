import { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  salt: string;
  images?: Array<Schema.Types.ObjectId>;
  isValidPassword: (password: string) => Promise<boolean>;
}

export interface DynamoUser {
  email: string;
  filename: string;
  path?: string;
  password: string;
  salt: string;
}

export interface DynamoImage {
  email: string;
  filename: string;
  path: string;
  metadata: object;
  date: Date;
}
