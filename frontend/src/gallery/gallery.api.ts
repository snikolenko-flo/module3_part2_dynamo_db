import { BASE_URL } from '../data/constants.js';
import { ImagesResponse } from '../interfaces/response';

export class GalleryApi {
  async fetchImages(pageNumber: number, pageLimit: number, user?: string): Promise<ImagesResponse> {
    const accessToken = localStorage.getItem('token');

    const defaultPage = 1;

    let url = `${BASE_URL}/gallery?page=${pageNumber}&limit=${pageLimit}`;
    url = user ? `${BASE_URL}/gallery?page=${defaultPage}&limit=${pageLimit}&filter=${user}` : url;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: accessToken,
      },
    });

    const result = (await response.json()) as ImagesResponse;

    console.log('result');
    console.log(result);
    
    if (response.ok) {
      return result;
    } else {
      const error = this.getError(result);
      throw Error(error);
    }
  }

  getError(response: ImagesResponse): string {
    if (response.errorMessage) {
      return response.errorMessage;
    } else {
      return response.message;
    }
  }
}
