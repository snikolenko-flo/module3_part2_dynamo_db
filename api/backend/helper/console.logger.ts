import { Logger } from './abstract.logger.js';

export class ConsoleLogger extends Logger {
  async writeLog(level: string, message: string) {
    const content = this.formatLogContent(level, message);
    console.log(content);
  }
}