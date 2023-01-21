import { GalleryManager } from './gallery.manager.js';
import { UrlManipulationService } from '../services/url-manipulation.service.js';
import { BASE_URL } from '../data/constants.js';

const urlService = new UrlManipulationService();
const manager = new GalleryManager();

export async function loadGallery(): Promise<void> {
  try {
    const pageNumber: number = urlService.getPageNumberFromUrl();
    const pageLimit: number = await urlService.getLimit();
    const user: string = urlService.getUserFromUrl();
    const images = await manager.api.fetchImages(pageNumber, pageLimit, user);

    manager.render.renderPagesList(images.total);
    manager.render.renderImages(images.objects);
    manager.url.addParametersToUrl(pageNumber, pageLimit, user);
  } catch (e) {
    alert(e);
  }
}

export async function fetchGallery(event: Event): Promise<void> {
  event.preventDefault();
  const pageNumber = Number((event.target as HTMLElement).innerText);

  const clickedPageNumber = manager.url.getClickedPageNumber(pageNumber);
  if (!clickedPageNumber) return;

  const pageLimit: number = urlService.getPageLimitFromUrl();
  const user: string = urlService.getUserFromUrl();

  try {
    let images = await manager.api.fetchImages(clickedPageNumber, pageLimit);
    if(user) {
      images = await manager.api.fetchImages(clickedPageNumber, pageLimit, user);
      manager.url.addParametersToUrl(pageNumber, pageLimit, user);
    } else {
      manager.url.addParametersToUrl(pageNumber, pageLimit);
    }
    manager.render.renderImages(images.objects);
  } catch (e) {
    alert(e);
  }
}

export async function uploadImage(event: Event): Promise<void> {
  event.preventDefault();

  const inputFile = document.getElementById('img') as HTMLFormElement;
  const formData = new FormData();

  for (const file of inputFile.files) {
    formData.append('files', file);
  }

  const url = `${BASE_URL}/upload`;
  const accessToken = localStorage.getItem('token');

  const options = {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: accessToken,
    },
  };

  try {
    await fetch(url, options);
    const pageLimit: number = urlService.getPageLimitFromUrl();
    const pageNumber: number = urlService.getPageNumberFromUrl();
    const user: string = urlService.getUserFromUrl();
    const limitStep = 1;

    if(user) {
      manager.url.addParametersToUrl(pageNumber, pageLimit+limitStep, user);
    } else {
      manager.url.addParametersToUrl(pageNumber, pageLimit+limitStep);
    }
    location.reload();
  } catch (e) {
    alert(e);
  }
}
