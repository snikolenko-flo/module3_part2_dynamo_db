import util from 'util';
import * as crypto from 'crypto';

export async function hashPassword(password: string, salt: string): Promise<string> {
  const crypt = util.promisify(crypto.pbkdf2);
  const hash = await crypt(password, salt, 1000, 64, 'sha512');
  return hash.toString('hex');
}
