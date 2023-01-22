import { writeFile } from 'node:fs/promises';
import { Logger } from './abstract.logger.js';
import { FileSystemService } from '../services/file.system.service.js';

const fsService = new FileSystemService();

export class FileLogger extends Logger {
  async writeLog(level: string, message: string) {
    const content = this.formatLogContent(level, message);

    if (!fsService.directoryExists(this.directory)) {
      await fsService.createDirectory('logs');
      this.directory = 'logs';
      return;
    }

    if (!fsService.fileExists(this.filePath)) {
      await fsService.createFile(this.filePath, content);
    }

    if (this.logTimeExpired()) {
      const date = new Date();
      const filePath = `./${this.directory}/logs_${date}.txt`;
      await fsService.createFile(filePath, content);

      this.fileCreated = date;
      this.fileName = `logs_${date}.txt`;
      this.filePath = filePath;
    } else {
      await writeFile(this.filePath, content,{flag: 'a+'});
    }
  }

  logTimeExpired(): boolean {
    const date = new Date();
    const dif = date.getTime() - this.fileCreated.getTime();
    return dif > this.logInterval;
  }
}