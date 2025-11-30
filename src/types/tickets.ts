import { IMessage } from "@/models/Message";
import { ICustomer } from "@/models/Customer";
import { IThread } from "@/models/Thread";

export type CustomerDTO = Pick<ICustomer, "name" | "email"> & {
  _id: string;
};

export type ThreadDTO = Omit<
  IThread,
  "customer" | "user" | "_id" | "lastMessageDate"
> & {
  _id: string;
  user: string;
  customer: CustomerDTO;
  lastMessageDate: string;
  __v: number;
};

export type MessageDTO = Omit<IMessage, "thread" | "_id" | "date"> & {
  _id: string;
  thread: string;
  date: string;
  __v: number;
};
