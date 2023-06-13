import * as crypto from 'crypto';

export const defaultUsersArray = [
  {
    email: 'admin@flo.team',
    password: 'jgF5tn4F123',
    salt: crypto.randomBytes(16).toString('hex'),
    images: [],
  },
  {
    email: 'asergeev@flo.team',
    password: 'jgF5tn4F',
    salt: crypto.randomBytes(16).toString('hex'),
    images: [],
  },
  {
    email: 'tpupkin@flo.team',
    password: 'tpupkin@flo.team',
    salt: crypto.randomBytes(16).toString('hex'),
    images: [],
  },
  {
    email: 'vkotikov@flo.team',
    password: 'po3FGas8',
    salt: crypto.randomBytes(16).toString('hex'),
    images: [],
  },
];
