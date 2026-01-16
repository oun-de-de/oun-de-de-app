import type { BasicStatus } from "./enum";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  status: BasicStatus;
  createdAt: string;
  avatar?: string;
}
