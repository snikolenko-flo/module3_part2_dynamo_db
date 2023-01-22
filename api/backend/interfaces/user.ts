import mongoose, { Schema } from 'mongoose';

export interface User {
  email: string;
  password: string;
  images?: Array<Schema.Types.ObjectId>;
}
