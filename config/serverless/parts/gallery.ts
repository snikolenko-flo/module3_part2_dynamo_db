import { AWSPartitial } from '../types';

export const getGalleryConfig: AWSPartitial = {
  functions: {
    apiAuthorizer: {
      handler: 'api/auth/handler.httpApiPolicy',
    },
    apiGetGallery: {
      handler: 'api/backend/gallery/handler.getGallery',
      description: 'Get gallery images',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/gallery',
            method: 'get',
            authorizer: {
              name: 'apiAuthorizer',
              type: 'request',
            },
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
