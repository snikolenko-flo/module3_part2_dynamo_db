"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryFile = void 0;
const constants_js_1 = require("../data/constants.js");
const promises_1 = require("node:fs/promises");
class GalleryFile {
    async getFilesAmount(directory, counter) {
        try {
            const dir = await (0, promises_1.opendir)(directory);
            counter = counter || 0;
            for await (const file of dir) {
                if (file.name.startsWith('.'))
                    continue;
                const isDir = await this.isDirectory(directory + '/' + file.name);
                if (isDir) {
                    counter = await this.getFilesAmount(directory + '/' + file.name, counter);
                }
                else {
                    counter++;
                }
            }
            return counter;
        }
        catch (err) {
            console.error(err);
        }
    }
    async isDirectory(filePath) {
        const isDir = await (0, promises_1.stat)(filePath);
        return isDir.isDirectory();
    }
    async getTotalPages(dir) {
        const filesAmount = await this.getFilesAmount(dir);
        const onePage = 1;
        if (filesAmount <= constants_js_1.PER_PAGE)
            return onePage;
        const remainder = filesAmount % constants_js_1.PER_PAGE;
        if (remainder === 0)
            return filesAmount / constants_js_1.PER_PAGE;
        return Math.trunc(filesAmount / constants_js_1.PER_PAGE) + onePage;
    }
    async getUserPagesNumber(dir, filesNumber) {
        const onePage = 1;
        if (filesNumber <= constants_js_1.PER_PAGE)
            return onePage;
        const remainder = filesNumber % constants_js_1.PER_PAGE;
        if (remainder === 0)
            return filesNumber / constants_js_1.PER_PAGE;
        return Math.trunc(filesNumber / constants_js_1.PER_PAGE) + onePage;
    }
    async getTotalPagesForLimit(dir, limit) {
        const filesAmount = limit;
        const onePage = 1;
        if (filesAmount <= constants_js_1.PER_PAGE)
            return onePage;
        const remainder = filesAmount % constants_js_1.PER_PAGE;
        if (remainder === 0)
            return filesAmount / constants_js_1.PER_PAGE;
        return Math.trunc(filesAmount / constants_js_1.PER_PAGE) + onePage;
    }
    async getPagesAmount(dir, limit) {
        const filesAmount = limit;
        const onePage = 1;
        if (filesAmount <= constants_js_1.PER_PAGE)
            return onePage;
        const remainder = filesAmount % constants_js_1.PER_PAGE;
        if (remainder === 0)
            return filesAmount / constants_js_1.PER_PAGE;
        return Math.trunc(filesAmount / constants_js_1.PER_PAGE) + onePage;
    }
}
exports.GalleryFile = GalleryFile;
