import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const defaultUsersArray = [
  {
    email: 'admin@flo.team',
    id: uuidv4(),
    type: 'user',
    password: 'jgF5tn4F123',
    salt: crypto.randomBytes(16).toString('hex'),
  },
  {
    email: 'asergeev@flo.team',
    id: uuidv4(),
    type: 'user',
    password: 'jgF5tn4F',
    salt: crypto.randomBytes(16).toString('hex'),
  },
  {
    email: 'tpupkin@flo.team',
    id: uuidv4(),
    type: 'user',
    password: 'tpupkin@flo.team',
    salt: crypto.randomBytes(16).toString('hex'),
  },
  {
    email: 'vkotikov@flo.team',
    id: uuidv4(),
    type: 'user',
    password: 'po3FGas8',
    salt: crypto.randomBytes(16).toString('hex'),
  },
];
