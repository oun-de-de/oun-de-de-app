import { setupWorker } from 'msw/browser';
import { mockTokenExpired } from './handlers/_demo';
import {
  dailyIncomePos,
  customerInfo,
  performance,
} from './handlers/_dashboard';
import { menuList } from './handlers/_menu';
import { signIn, userList } from './handlers/_user';
import { customerList } from './handlers/_customer';

const handlers = [
  signIn,
  userList,
  mockTokenExpired,
  menuList,
  customerList,
  dailyIncomePos,
  customerInfo,
  performance,
];
const worker = setupWorker(...handlers);

export { worker };
