import { stat } from 'fs/promises';
import { load } from 'piexifjs';

export class FileService {
  getMetadata = function (buffer: Buffer, type: string): object {
    let metadata = {};
    if (type === 'image/jpeg') {
      metadata = load(buffer.toString('binary'));
    }
    return metadata;
  };
  async isDirectory(filePath: string): Promise<boolean> {
    const isDir = await stat(filePath);
    return isDir.isDirectory();
  }
}
