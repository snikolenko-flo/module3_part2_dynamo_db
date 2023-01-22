import { GalleryError } from './gallery.error.js';
import { GalleryFile } from './gallery.file.js';
import { GalleryResponse } from './gallery.response.js';

export class GalleryManager {
  error: GalleryError;
  file: GalleryFile;
  response: GalleryResponse;

  constructor() {
    this.error = new GalleryError();
    this.file = new GalleryFile();
    this.response = new GalleryResponse();
  }
}
