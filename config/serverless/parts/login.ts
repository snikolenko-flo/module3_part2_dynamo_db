import { AWSPartitial } from '../types';

export const getLoginConfig: AWSPartitial = {
  params: {
    default: {
      // SNS: ''
    },
  },
  functions: {
    apiGetLogin: {
      handler: 'api/backend/login/handler.login',
      description: 'Show the default login page',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/',
            method: 'get',
          },
        },
      ],
    },
  },
};
