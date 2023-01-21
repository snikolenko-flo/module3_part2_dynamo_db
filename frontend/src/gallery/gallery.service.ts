import { BASE_URL } from '../data/constants.js';

export class GalleryService {
  wrapUrlsInHtml(urlsList: URL[]): string {
    let images = '';

    urlsList.forEach(function (url) {
      images += `<div class="gallery">
                   <img src="${BASE_URL}/${url}">
                 </div>`;
    });
    return images;
  }

  wrapNumbersInHtml(totalPages: number): string {
    let pagesList = '';

    for (let i = 1; i <= totalPages; i++) {
      pagesList += `<a href="">
                      <li>${i}</li>
                    </a>`;
    }
    return pagesList;
  }

  redirectToPage(pageNumber: number, pageLimit: number): void {
    window.location.href = `gallery.html?page=${pageNumber}&limit=${pageLimit}`;
  }
}
