import { AWSPartitial } from '../types';

export const uploadConfig: AWSPartitial = {
  functions: {
    apiAuthorizer: {
      handler: 'api/auth/handler.httpApiPolicy',
    },
    apiUploadImage: {
      handler: 'api/backend/upload/handler.upload',
      description: 'Upload user image',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/upload',
            method: 'post',
            authorizer: {
              name: 'apiAuthorizer',
              type: 'request',
            },
          },
        },
      ],
    },
  },
};
