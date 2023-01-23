import { AWSPartitial } from '../types';

export const getSignupConfig: AWSPartitial = {
  params: {
    default: {
      // SNS: ''
    },
  },
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
