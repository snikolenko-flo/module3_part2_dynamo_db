import { FileLogger } from './file.logger.js';
import { ConsoleLogger } from './console.logger.js';

class SimpleLogger {
  createFileLogger(){
    return new FileLogger();
  }
  createConsoleLogger() {
    return new ConsoleLogger();
  }
}

export const logger = new SimpleLogger();