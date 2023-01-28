"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbService = void 0;
const promises_1 = require("node:fs/promises");
const user_model_js_1 = require("../models/user.model.js");
const image_model_js_1 = require("../models/image.model.js");
const gallery_file_js_1 = require("../gallery/gallery.file.js");
const logger_js_1 = require("../helper/logger.js");
const mongoose_1 = __importDefault(require("mongoose"));
const file_system_service_js_1 = require("./file.system.service.js");
const constants_js_1 = require("../data/constants.js");
const node_crypto_1 = __importDefault(require("node:crypto"));
const galleryService = new gallery_file_js_1.GalleryFile();
const fsService = new file_system_service_js_1.FileSystemService();
class DbService {
    async uploadImageData(filePath, userEmail) {
        const fileMetadata = await fsService.getFileMetadata(filePath);
        const pathWithoutBuiltFolder = fsService.removeFirstDirFromPath(filePath);
        const isImage = await image_model_js_1.Image.findOne({ path: pathWithoutBuiltFolder }).exec();
        if (isImage)
            return;
        const user = await user_model_js_1.User.findOne({ email: userEmail }).exec();
        const date = new Date();
        const image = new image_model_js_1.Image({
            path: pathWithoutBuiltFolder,
            metadata: fileMetadata,
            date: date,
            user: user._id,
        });
        await image.save();
        logger_js_1.log.info(`The image ${filePath} was saved`);
    }
    async addImagesData(directory) {
        try {
            const dir = await (0, promises_1.opendir)(directory);
            for await (const file of dir) {
                try {
                    if (file.name.startsWith('.'))
                        continue;
                    const filePath = directory + '/' + file.name;
                    const isDir = await galleryService.isDirectory(filePath);
                    if (isDir) {
                        await this.addImagesData(filePath);
                    }
                    else {
                        const fileStat = await (0, promises_1.stat)(filePath);
                        const pathWithoutBuiltFolder = fsService.getPathWithoutBuiltFolder(directory, file.name);
                        const isImage = await image_model_js_1.Image.findOne({ path: pathWithoutBuiltFolder }).exec();
                        if (isImage)
                            return;
                        const date = new Date();
                        const image = new image_model_js_1.Image({
                            path: pathWithoutBuiltFolder,
                            metadata: fileStat,
                            date: date,
                        });
                        await image.save();
                    }
                }
                catch (e) {
                    logger_js_1.log.error(`${e} | class: ${this.constructor.name} | function: addImagesData.`);
                }
            }
        }
        catch (e) {
            logger_js_1.log.error(`${e} | class: ${this.constructor.name} | function: addImagesData.`);
        }
    }
    async addDefaultUsers() {
        const defaultUsersArray = ['asergeev@flo.team', 'tpupkin@flo.team', 'vkotikov@flo.team'];
        try {
            const records = await user_model_js_1.User.find({ email: { $in: defaultUsersArray } });
            if (records.length)
                return;
            const asergeev = new user_model_js_1.User({
                email: 'asergeev@flo.team',
                password: 'jgF5tn4F',
                salt: node_crypto_1.default.randomBytes(16).toString('hex')
            });
            await asergeev.save();
            logger_js_1.log.info(`The user ${asergeev.email} was saved to DB.`);
            const tpupkin = new user_model_js_1.User({
                email: 'tpupkin@flo.team',
                password: 'tpupkin@flo.team',
                salt: node_crypto_1.default.randomBytes(16).toString('hex')
            });
            await tpupkin.save();
            logger_js_1.log.info(`The user ${tpupkin.email} was saved to DB.`);
            const vkotikov = new user_model_js_1.User({
                email: 'vkotikov@flo.team',
                password: 'po3FGas8',
                salt: node_crypto_1.default.randomBytes(16).toString('hex')
            });
            await vkotikov.save();
            logger_js_1.log.info(`The user ${vkotikov.email} was saved to DB.`);
        }
        catch (e) {
            logger_js_1.log.error(`${e} | class: ${this.constructor.name} | function: addDefaultUsers.`);
        }
    }
    async findUser(email) {
        const user = await user_model_js_1.User.findOne({ email: email }).select(['email', 'password', 'salt']).exec();
        return user;
    }
    async getImagesNumber() {
        const imagesNumber = await image_model_js_1.Image.count();
        return imagesNumber;
    }
    async getUserImagesNumber(userEmail, limit) {
        const images = await this.getImagesOfUser(userEmail, limit);
        return images.length;
    }
    async getImagesPerPage(images, page, perPage) {
        const endIndex = page * perPage;
        const start = endIndex - perPage;
        return images.slice(start, endIndex);
    }
    sortImagesFromOldToNew(images) {
        return images.sort((a, b) => a.date - b.date);
    }
    retrieveImagesPaths(images) {
        return images.map((item) => item.path);
    }
    async getImages(page, limit) {
        try {
            const images = await image_model_js_1.Image.find({}).select(['path', 'date']).sort({ date: -1 }).limit(limit);
            const sortedImages = this.sortImagesFromOldToNew(images);
            const imagesPaths = this.retrieveImagesPaths(sortedImages);
            return this.getImagesPerPage(imagesPaths, page, constants_js_1.PER_PAGE);
        }
        catch (e) {
            logger_js_1.log.error(`${e} | class: ${this.constructor.name} | function: getImages.`);
        }
    }
    async getImagesOfUser(userEmail, limit) {
        try {
            const user = await user_model_js_1.User.findOne({ 'email': userEmail }).exec();
            const images = await image_model_js_1.Image.find({ user: user.id }).select(['path', 'date']).sort({ date: -1 }).limit(limit);
            return images;
        }
        catch (e) {
            logger_js_1.log.error(`${e} | class: ${this.constructor.name} | function: getImagesOfUser.`);
        }
    }
    async getUserImages(page, limit, userEmail) {
        try {
            const images = await this.getImagesOfUser(userEmail, limit);
            const sortedImages = this.sortImagesFromOldToNew(images);
            const imagesPaths = this.retrieveImagesPaths(sortedImages);
            return this.getImagesPerPage(imagesPaths, page, constants_js_1.PER_PAGE);
        }
        catch (e) {
            logger_js_1.log.error(`${e} | class: ${this.constructor.name} | function: getImages.`);
        }
    }
    async connectToDb(mongoUrl) {
        try {
            await mongoose_1.default.connect(mongoUrl);
            logger_js_1.log.info(`Database is running at ${mongoUrl}`);
        }
        catch (e) {
            logger_js_1.log.error(`${e} | class: ${this.constructor.name} | function: connectToDb.`);
        }
    }
    async addDefaultUsersToDB() {
        try {
            await this.addDefaultUsers();
            logger_js_1.log.info('Default users have been added to DB.');
        }
        catch (e) {
            logger_js_1.log.error(`${e} | class: ${this.constructor.name} | function: addDefaultUsersToDB.`);
        }
    }
    async addImagesDataToDB(imagesDir) {
        try {
            await this.addImagesData(imagesDir);
            logger_js_1.log.info('Images have been added to DB.');
        }
        catch (e) {
            logger_js_1.log.error(`${e} | class: ${this.constructor.name} | function: addImagesDataToDB.`);
        }
    }
    async startDb(imagesDir, mongoUrl) {
        await this.connectToDb(mongoUrl);
        await this.addDefaultUsersToDB();
        await this.addImagesDataToDB(imagesDir);
    }
    async createUser(email, password, salt) {
        const user = (await user_model_js_1.User.create({ email, password, salt }));
        return user;
    }
}
exports.DbService = DbService;
