import { loadGallery, fetchGallery, uploadImage } from './handler.js';
import { TokenService } from '../services/token.service.js';

const tokenService = new TokenService();
tokenService.checkToken();

(async () => await loadGallery())();

const pages = document.getElementById('pages');
pages.onclick = fetchGallery;

const form = document.getElementById('image_form');
form.onsubmit = uploadImage;