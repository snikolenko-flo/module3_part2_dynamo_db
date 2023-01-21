import { RenderGalleryHtml } from './gallery.render.js';
import { GalleryApi } from './gallery.api.js';
import { GalleryUrl } from './gallery.url.js';

export class GalleryManager {
  render: RenderGalleryHtml;
  api: GalleryApi;
  url: GalleryUrl;

  constructor() {
    this.render = new RenderGalleryHtml();
    this.api = new GalleryApi();
    this.url = new GalleryUrl();
  }
}
