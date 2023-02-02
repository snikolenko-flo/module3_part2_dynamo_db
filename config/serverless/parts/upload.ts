//import { simpleAuthorizer } from '../../../api/backend/login/handler';
import { AWSPartitial } from '../types';

export const uploadConfig: AWSPartitial = {
  params: {
    default: {
      // SNS: ''
    },
  },
  custom: {
    s3: {
      host: 'localhost',
      directory: '/tmp',
    },
  },
  functions: {
    apiUploadImage: {
      handler: 'api/backend/upload/handler.upload',
      description: 'Upload user image',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/upload',
            method: 'post',
          },
        },
      ],
    },
    apiS3Hook: {
      handler: 'api/backend/upload/handler.s3hook',
      description: 'Show data about images uploaded to s3',
      timeout: 28,
      events: [
        {
          s3: {
            bucket: 'local-bucket',
            event: 's3:*',
          },
        },
      ],
    },
  },
};
