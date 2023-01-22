import { logger } from './factory.logger.js';
import * as dotenv from 'dotenv';
dotenv.config();

const stage = process.env.STAGE;
export const log = createLogger(stage);

function createLogger (stage) {
  if(stage === 'local') {
    return logger.createFileLogger();
  } else {
    return logger.createConsoleLogger();
  }
}
