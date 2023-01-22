import * as os from 'node:os';

export abstract class Logger {
  fileCreated: Date;
  fileName: string;
  filePath: string;
  directory: string;
  logInterval: number;
  minutes: number;
  oneMinuteInMs: number;

  constructor() {
    this.fileCreated = new Date();
    this.directory = 'logs';
    this.fileName = `logs_${this.fileCreated}.txt`;
    this.filePath = `./${this.directory}/${this.fileName}`;
    this.minutes = 1;
    this.oneMinuteInMs = 60000;
    this.logInterval = this.oneMinuteInMs * this.minutes;
  }

  abstract writeLog(level: string, message: string): Promise<void>;

  formatLogContent(level: string, message: string): string {
    return level + ': ' + message + os.EOL;
  }

  fatal(message: string) {
    this.writeLog('fatal', message);
  }

  error(message: string) {
    this.writeLog('error', message);
  }

  warn(message: string) {
    this.writeLog('warn', message);
  }

  info(message: string) {

    this.writeLog('info', message);
  }

  debug(message) {
    this.writeLog('debug', message);
  }

  trace(message) {
    this.writeLog('trace', message);
  }
}

