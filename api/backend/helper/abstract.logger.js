"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const os = __importStar(require("node:os"));
class Logger {
    constructor() {
        this.fileCreated = new Date();
        this.directory = 'logs';
        this.fileName = `logs_${this.fileCreated}.txt`;
        this.filePath = `./${this.directory}/${this.fileName}`;
        this.minutes = 1;
        this.oneMinuteInMs = 60000;
        this.logInterval = this.oneMinuteInMs * this.minutes;
    }
    formatLogContent(level, message) {
        return level + ': ' + message + os.EOL;
    }
    fatal(message) {
        this.writeLog('fatal', message);
    }
    error(message) {
        this.writeLog('error', message);
    }
    warn(message) {
        this.writeLog('warn', message);
    }
    info(message) {
        this.writeLog('info', message);
    }
    debug(message) {
        this.writeLog('debug', message);
    }
    trace(message) {
        this.writeLog('trace', message);
    }
}
exports.Logger = Logger;
