"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const file_logger_js_1 = require("./file.logger.js");
const console_logger_js_1 = require("./console.logger.js");
class SimpleLogger {
    createFileLogger() {
        return new file_logger_js_1.FileLogger();
    }
    createConsoleLogger() {
        return new console_logger_js_1.ConsoleLogger();
    }
}
exports.logger = new SimpleLogger();
