import { GalleryFile } from './gallery.file.js';

export class GalleryManager {
  file: GalleryFile;

  constructor() {
    this.file = new GalleryFile();
  }
}
