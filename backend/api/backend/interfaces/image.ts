import { Document } from 'mongoose';

export interface Images extends Document {
  date?: Date;
  path?: string;
}
