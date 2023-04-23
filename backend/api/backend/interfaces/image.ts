import { Document } from 'mongoose';

export interface Images extends Document {
  date?: Date;
  path?: string;
}

export interface DynamoImages {
  date?: Date;
  path?: string;
}