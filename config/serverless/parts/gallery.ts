import { AWSPartitial } from '../types';

export const getGalleryConfig: AWSPartitial = {
  params: {
    default: {
      // SNS: ''
    },
  },
  functions: {
    apiGetGallery: {
      handler: 'api/backend/login/handler.loadGallery',
      description: 'Show the gallery page',
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
  },
};
