import { AWSPartitial } from '../types';

export const getSignupConfig: AWSPartitial = {
  functions: {
    apiGetSignup: {
      handler: 'api/backend/signup/handler.signup',
      description: 'Show the default signup page',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/signup',
            method: 'post',
          },
        },
      ],
    },
  },
};
