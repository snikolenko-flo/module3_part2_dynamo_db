"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLogger = void 0;
const promises_1 = require("node:fs/promises");
const abstract_logger_js_1 = require("./abstract.logger.js");
const file_system_service_js_1 = require("../services/file.system.service.js");
const fsService = new file_system_service_js_1.FileSystemService();
class FileLogger extends abstract_logger_js_1.Logger {
    async writeLog(level, message) {
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
        }
        else {
            await (0, promises_1.writeFile)(this.filePath, content, { flag: 'a+' });
        }
    }
    logTimeExpired() {
        const date = new Date();
        const dif = date.getTime() - this.fileCreated.getTime();
        return dif > this.logInterval;
    }
}
exports.FileLogger = FileLogger;
