import { AWSPartitial } from '../types';

export const getGalleryConfig: AWSPartitial = {
  params: {
    default: {
      // SNS: ''
    },
  },
  functions: {
    apiGetGallery: {
      handler: 'api/backend/gallery/handler.getGallery',
      description: 'Get gallery images',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/gallery',
            method: 'get',
          },
        },
      ],
    },
    apiGetImagesLimit: {
      handler: 'api/backend/gallery/handler.getImagesLimit',
      description: 'Return a number of images that are on a backend',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/gallery/limit',
            method: 'get',
          },
        },
      ],
    },
  },
};
