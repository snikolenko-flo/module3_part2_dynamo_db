import * as crypto from 'crypto';

export const defaultUsersArray = [
  {
    email: 'admin@flo.team',
    filename: 'default',
    path: 'default',
    password: 'jgF5tn4F123',
    salt: crypto.randomBytes(16).toString('hex'),
  },
  {
    email: 'asergeev@flo.team',
    filename: 'default',
    path: 'default',
    password: 'jgF5tn4F',
    salt: crypto.randomBytes(16).toString('hex'),
  },
  {
    email: 'tpupkin@flo.team',
    filename: 'default',
    path: 'default',
    password: 'tpupkin@flo.team',
    salt: crypto.randomBytes(16).toString('hex'),
  },
  {
    email: 'vkotikov@flo.team',
    filename: 'default',
    path: 'default',
    password: 'po3FGas8',
    salt: crypto.randomBytes(16).toString('hex'),
  },
];
