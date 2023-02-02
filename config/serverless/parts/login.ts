//import { simpleAuthorizer } from '../../../api/backend/login/handler';
import { AWSPartitial } from '../types';

export const getLoginConfig: AWSPartitial = {
  params: {
    default: {
      // SNS: ''
    },
  },
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
    }
  },
};
