import { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  salt: string;
  images?: Array<Schema.Types.ObjectId>;
  isValidPassword: (password: string) => Promise<boolean>;
}

// User type for Dynamo DB.
export interface DynamoUser {
  email: string;
  path?: string;
  password: string;
  salt: string;
}

// Image type for Dynamo DB.
export interface DynamoImage {
  email: string;
  path: string;
  metadata: object;
  date: Date;
}
