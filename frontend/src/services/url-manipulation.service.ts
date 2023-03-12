import { BASE_URL } from '../data/constants.js';

export class UrlManipulationService {
  getPageNumberFromUrl(): number {
    const currentUrl: string = window.location.search;

    const searchParams: URLSearchParams = new URLSearchParams(currentUrl);

    const page: string = searchParams.get('page');
    const defaultPageNumber = 1;

    if (!page) {
      return defaultPageNumber;
    }

    const pageNumber: number = parseInt(page);

    if (isNaN(pageNumber)) {
      throw Error('The page number should be an integer');
    }

    if (!isFinite(pageNumber)) {
      throw Error('The page number should be a finite integer');
    }

    return pageNumber;
  }

  getUserFromUrl(): string {
    const currentUrl: string = window.location.search;

    const searchParams: URLSearchParams = new URLSearchParams(currentUrl);
    const user: string = searchParams.get('filter');

    return user;
  }

  async getLimit(): Promise<number> {
    let limit = this.getPageLimitFromUrl();
    if (!limit) {
      limit = await this.fetchLimit();
    }
    return limit;
  }

  getPageLimitFromUrl(): number {
    const currentUrl: string = window.location.search;

    const searchParams: URLSearchParams = new URLSearchParams(currentUrl);

    const limit: string = searchParams.get('limit');

    if (!limit) return;

    const pageLimit: number = parseInt(limit);

    if (isNaN(pageLimit)) {
      throw Error('The page number should be an integer');
    }

    if (!isFinite(pageLimit)) {
      throw Error('The page number should be a finite integer');
    }

    return pageLimit;
  }

  async fetchLimit() {
    try {
      const accessToken = localStorage.getItem('token');
      const url = `${BASE_URL}/gallery/limit`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: accessToken,
        },
      });

      const pageLimit = await response.json();
      return JSON.parse(pageLimit).limit;
    } catch (e) {
      alert(`The error "${e}" has happened in the function "frontend/src/services/url-manipulation.service.ts/UrlManipulationService/fetchLimit()"`);
    }
  }
}
