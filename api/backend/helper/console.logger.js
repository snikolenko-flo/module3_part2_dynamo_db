"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogger = void 0;
const abstract_logger_js_1 = require("./abstract.logger.js");
class ConsoleLogger extends abstract_logger_js_1.Logger {
    async writeLog(level, message) {
        const content = this.formatLogContent(level, message);
        console.log(content);
    }
}
exports.ConsoleLogger = ConsoleLogger;
