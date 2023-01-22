import fs from 'fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';

export class FileSystemService {
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  directoryExists(directory: string) {
    return fs.existsSync(directory);
  }

  async createFile(file: string, content: string) {
    await writeFile(file, content, {flag: 'a+'});
  }

  async createDirectory(dirName: string) {
    await mkdir(dirName, {recursive: true});
  }

  removeFirstDirFromPath(filePath: string): string {
    return filePath.split('/').slice(1).join('/');
  }

  getPathWithoutBuiltFolder(directory: string, fileName: string): string {
    const directoryWithoutBuiltFolder = directory.split('/').slice(2).join('/');
    return directoryWithoutBuiltFolder + '/' + fileName;
  }

  async getFileMetadata(filePath) {
    const fileStat = await stat(filePath);
    return fileStat;
  }
}
