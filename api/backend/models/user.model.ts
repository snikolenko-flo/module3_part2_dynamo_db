import mongoose, { Schema } from 'mongoose';
import crypto from 'node:crypto';
import util from 'util';

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
});

UserSchema.pre(
  'save',
  async function(next) {
  const crypt = util.promisify(crypto.pbkdf2);
  const hash = await crypt(this.password, this.salt, 1000, 64, 'sha512');
  this.password = hash.toString('hex');
  next();
});

UserSchema.methods.isValidPassword = async function (password) {
  const crypt = util.promisify(crypto.pbkdf2);
  const hash = await crypt(password, this.salt, 1000, 64, 'sha512');
  return this.password === hash.toString('hex');
};

export const User = mongoose.model('User', UserSchema);
