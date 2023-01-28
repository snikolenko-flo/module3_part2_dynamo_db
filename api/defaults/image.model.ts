import mongoose, { Schema } from 'mongoose';

const ImagesSchema: Schema = new Schema({
  path: { type: String, required: true, unique: true },
  metadata: { type: Object, required: true },
  date: { type: Date},
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

export const Image = mongoose.model('Image', ImagesSchema);
