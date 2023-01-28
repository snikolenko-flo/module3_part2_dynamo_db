"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemService = void 0;
const fs_1 = __importDefault(require("fs"));
const promises_1 = require("node:fs/promises");
class FileSystemService {
    fileExists(filePath) {
        return fs_1.default.existsSync(filePath);
    }
    directoryExists(directory) {
        return fs_1.default.existsSync(directory);
    }
    async createFile(file, content) {
        await (0, promises_1.writeFile)(file, content, { flag: 'a+' });
    }
    async createDirectory(dirName) {
        await (0, promises_1.mkdir)(dirName, { recursive: true });
    }
    removeFirstDirFromPath(filePath) {
        return filePath.split('/').slice(1).join('/');
    }
    getPathWithoutBuiltFolder(directory, fileName) {
        const directoryWithoutBuiltFolder = directory.split('/').slice(2).join('/');
        return directoryWithoutBuiltFolder + '/' + fileName;
    }
    async getFileMetadata(filePath) {
        const fileStat = await (0, promises_1.stat)(filePath);
        return fileStat;
    }
}
exports.FileSystemService = FileSystemService;
