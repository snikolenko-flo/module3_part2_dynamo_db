import { AWSPartitial } from '../types';

export const getLoginConfig: AWSPartitial = {
  functions: {
    apiLoginUser: {
      handler: 'api/backend/login/handler.login',
      description: 'Login user',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/login',
            method: 'post',
          },
        },
      ],
    },
  },
};
