import { opendir, stat } from 'node:fs/promises';
import { uploadToS3 } from '../backend/services/s3.service';
import { Image } from '../backend/models/image.model';
import { User } from '../backend/models/user.model';
import mongoose from 'mongoose';
import * as crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import fs from 'fs';
import { getMetadata } from '../backend/services/file.service';

export class DbService {
  private async isDirectory(filePath: string): Promise<boolean> {
    const isDir = await stat(filePath);
    return isDir.isDirectory();
  }

  async addImagesData(directory: string): Promise<void> {
    try {
      const dir = await opendir(directory);

      for await (const file of dir) {
        try {
          if (file.name.startsWith('.')) continue;

          const filePath = directory + '/' + file.name;
          const isDir = await this.isDirectory(filePath);

          if (isDir) {
            await this.addImagesData(filePath);
          } else {
            const buffer = fs.readFileSync(filePath);
            console.log('buffer from addImagesData');
            console.log(buffer);
            const metadata = getMetadata(buffer);

            const path = `http://localhost:4569/local-bucket/${file.name}`;
            const isImage = await Image.findOne({ path: path }).exec();

            if (isImage) return;
            const data = await readFile(filePath);
            uploadToS3(data, file.name, 'local-bucket');
            const date = new Date();
            const image = new Image({
              path: path,
              metadata: metadata,
              date: date,
            });
            await image.save();
          }
        } catch (e) {
          console.log(`${e} | class: ${this.constructor.name} | function: addImagesData.`);
        }
      }
    } catch (e) {
      console.log(`${e} | class: ${this.constructor.name} | function: addImagesData.`);
    }
  }

  async addDefaultUsers(): Promise<void> {
    const defaultUsersArray = ['asergeev@flo.team', 'tpupkin@flo.team', 'vkotikov@flo.team'];

    try {
      const records = await User.find({ email: { $in: defaultUsersArray } });
      if (records.length) return;

      const asergeev = new User({
        email: 'asergeev@flo.team',
        password: 'jgF5tn4F',
        salt: crypto.randomBytes(16).toString('hex')
      });
      await asergeev.save();
      console.log(`The user ${asergeev.email} was saved to DB.`);

      const tpupkin = new User({
        email: 'tpupkin@flo.team',
        password: 'tpupkin@flo.team',
        salt: crypto.randomBytes(16).toString('hex')
      });
      await tpupkin.save();
      console.log(`The user ${tpupkin.email} was saved to DB.`);

      const vkotikov = new User({
        email: 'vkotikov@flo.team',
        password: 'po3FGas8',
        salt: crypto.randomBytes(16).toString('hex')
      });
      await vkotikov.save();
      console.log(`The user ${vkotikov.email} was saved to DB.`);
    } catch (e) {
      console.log(`${e} | class: ${this.constructor.name} | function: addDefaultUsers.`);
    }
  }

  private async connectToDb(mongoUrl: string): Promise<void> {
    try {
      await mongoose.connect(mongoUrl);
      console.log(`Database is running at ${mongoUrl}`);
    } catch (e) {
      console.log(`${e} | class: ${this.constructor.name} | function: connectToDb.`);
    }
  }

  private async addDefaultUsersToDB(): Promise<void> {
    try {
      await this.addDefaultUsers();
      console.log('Default users have been added to DB.');
    } catch (e) {
      console.log(`${e} | class: ${this.constructor.name} | function: addDefaultUsersToDB.`);
    }
  }

  private async addImagesDataToDB(imagesDir: string): Promise<void> {
    try {
      await this.addImagesData(imagesDir);
      console.log('Images have been added to DB.');
    } catch (e) {
      console.log(`${e} | class: ${this.constructor.name} | function: addImagesDataToDB.`);
    }
  }

  async startDb(imagesDir: string, mongoUrl: string): Promise<void> {
    await this.connectToDb(mongoUrl);
    await this.addDefaultUsersToDB();
    await this.addImagesDataToDB(imagesDir);
    process.exit();
  }
}

// Get file size.
// const fs = require('fs');
//
// const stream = fs.createReadStream('file.txt');
//
// let size = 0;
//
// stream.on('data', (chunk) => {
//   size += chunk.length;
// });
//
// stream.on('end', () => {
//   console.log(`Size of the file is: ${size} bytes`);
// });

// const path = require('path');
//
// const buffer = Buffer.from('hello world', 'utf8');
// const fileName = 'file.txt';
// const ext = path.extname(fileName);
//
// console.log(`File extension: ${ext}`);

// const fileType = require('file-type');
//
// // Example buffer containing the contents of a PNG image file
// const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
//
// const result = fileType(buffer);
//
// console.log(result);
// // Output: { ext: 'png', mime: 'image/png' }
