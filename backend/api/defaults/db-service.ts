import { opendir, readFile } from 'fs/promises';
import { Images } from '../backend/interfaces/image';
import { uploadToS3 } from '../backend/services/s3.service';
import { Image } from '../backend/models/image.model';
import { User } from '../backend/models/user.model';
import * as crypto from 'crypto';
import { FileService } from '../backend/services/file.service';
import mongoose from 'mongoose';

const defaultImagesType = 'image/jpeg';
const fileService = new FileService();
const pathToBucket = 'https://stanislav-flo-test-bucket.s3.ap-northeast-1.amazonaws.com/local-bucket';

export class DbService {
  private async addImagesData(directory: string): Promise<void> {
    try {
      const dir = await opendir(directory);
      for await (const file of dir) {
        if (file.name.startsWith('.')) continue;
        const fullPath = this.createFullPath(directory, file.name);
        const isDir = await fileService.isDirectory(fullPath);

        if (isDir) {
          await this.addImagesData(fullPath);
        } else {
          const isImage = await this.isFileInDb(file.name);
          if (isImage) return;
          await this.saveFile(directory, file.name);
        }
      }
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: addImagesData.`);
    }
  }

  private createFullPath(directory: string, filename: string): string {
    return directory + '/' + filename;
  }
  private async addImage(path: string, metadata: object): Promise<void> {
    const image = new Image({
      path: path,
      metadata: metadata,
      date: new Date(),
    });
    await image.save();
  }

  private async saveFile(directory: string, fileName: string): Promise<void> {
    const buffer = await readFile(directory + '/' + fileName);
    const metadata = fileService.getMetadata(buffer, defaultImagesType);

    uploadToS3(buffer, fileName, 'local-bucket');
    await this.addImage(`${pathToBucket}/${fileName}`, metadata);
  }

  private async isFileInDb(fileName: string): Promise<Images> {
    return await Image.findOne({ path: `${pathToBucket}/${fileName}` }).exec();
  }

  private async addDefaultUsers(): Promise<void> {
    const defaultUsersArray = ['asergeev@flo.team', 'tpupkin@flo.team', 'vkotikov@flo.team'];

    try {
      const records = await User.find({ email: { $in: defaultUsersArray } });
      if (records.length) return;

      const asergeev = new User({
        email: 'asergeev@flo.team',
        password: 'jgF5tn4F',
        salt: crypto.randomBytes(16).toString('hex'),
      });
      await asergeev.save();
      console.log(`The user ${asergeev.email} was saved to DB.`);

      const tpupkin = new User({
        email: 'tpupkin@flo.team',
        password: 'tpupkin@flo.team',
        salt: crypto.randomBytes(16).toString('hex'),
      });
      await tpupkin.save();
      console.log(`The user ${tpupkin.email} was saved to DB.`);

      const vkotikov = new User({
        email: 'vkotikov@flo.team',
        password: 'po3FGas8',
        salt: crypto.randomBytes(16).toString('hex'),
      });
      await vkotikov.save();
      console.log(`The user ${vkotikov.email} was saved to DB.`);
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: addDefaultUsers.`);
    }
  }

  private async connectToDb(mongoUrl: string): Promise<void> {
    try {
      await mongoose.connect(mongoUrl);
      console.log(`Database is running at ${mongoUrl}`);
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: connectToDb.`);
    }
  }

  private async addDefaultUsersToDB(): Promise<void> {
    try {
      await this.addDefaultUsers();
      console.log('Default users have been added to DB.');
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: addDefaultUsersToDB.`);
    }
  }

  private async addImagesDataToDB(imagesDir: string): Promise<void> {
    try {
      await this.addImagesData(imagesDir);
      console.log('Images have been added to DB.');
    } catch (e) {
      throw Error(`${e} | class: ${this.constructor.name} | function: addImagesDataToDB.`);
    }
  }

  async startDb(imagesDir: string, mongoUrl: string): Promise<void> {
    await this.connectToDb(mongoUrl);
    await this.addDefaultUsersToDB();
    await this.addImagesDataToDB(imagesDir);
  }
}
