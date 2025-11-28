"use server";

import { connectToDB } from "@/lib/mongoose";
import { Thread, Message, Customer } from "@/models";
import { auth } from "@/auth";
import { IThread } from "@/models/Thread";
import { IMessage } from "@/models/Message";

interface ILeanCustomer {
  _id: string;
  name: string;
  email: string;
}

interface ILeanThread
  extends Omit<IThread, "customer" | "user" | "_id" | "__v"> {
  _id: string;
  user: string;
  customer: ILeanCustomer;
}

export interface ILeanMessage extends Omit<IMessage, "thread" | "_id" | "__v"> {
  _id: string;
  thread: string;
}

export async function getTickets(page = 1, limit = 10) {
  await connectToDB();

  const session = await auth();
  const userId = session?.user.id;

  const skip = (page - 1) * limit;

  const threads = (await Thread.find({ user: userId })
    .populate("customer", "name email") // Populate customer details
    .sort({ lastMessageDate: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .lean()) as unknown as ILeanThread[]; // Important: Converts to plain JS object for Next.js

  const totalCount = await Thread.countDocuments({ user: userId });

  // Serialize ObjectIds to strings to avoid "Server Component" warnings
  const serializedThreads = threads.map((t) => ({
    ...t,
    _id: t._id.toString(),
    user: t.user.toString(),
    customer: t.customer
      ? {
          ...t.customer,
          _id: t.customer._id.toString(),
        }
      : null,
    lastMessageDate: t.lastMessageDate.toISOString(),
  }));

  return { threads: serializedThreads, totalCount };
}

export async function getTicketDetails(threadId: string) {
  await connectToDB();

  const thread = (await Thread.findById(threadId)
    .populate("customer")
    .lean()) as ILeanThread & { __v: number };

  if (!thread) return null;

  const messages = (await Message.find({ thread: threadId })
    .sort({ date: 1 })
    .lean()) as unknown as ILeanMessage[];

  // Serialize
  return {
    thread: {
      ...thread,
      _id: thread._id.toString(),
      user: thread.user.toString(),
      customer: { ...thread.customer, _id: thread.customer._id.toString() },
      lastMessageDate: thread.lastMessageDate.toISOString(),
    },
    messages: messages.map((m) => ({
      ...m,
      _id: m._id.toString(),
      thread: m.thread.toString(),
      date: m.date.toISOString(),
    })),
  };
}
