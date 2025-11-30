"use server";

import { connectToDB } from "@/lib/mongoose";
import { Thread, Message } from "@/models";
import { auth } from "@/auth";
import jsonify from "@/utils/jsonify";
import { ThreadDTO, MessageDTO, CustomerDTO } from "@/types/tickets";

type ThreadPopulated = Omit<
  ThreadDTO,
  "customer" | "user" | "lastMessageDate"
> & {
  customer: CustomerDTO;
  _id: any;
  user: any;
  lastMessageDate: Date;
};

export async function getTickets(
  page = 1,
  limit = 10
): Promise<{ threads: ThreadDTO[]; totalCount: number }> {
  await connectToDB();

  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const skip = (page - 1) * limit;

  const threads = await Thread.find({ user: userId })
    .populate<{ customer: CustomerDTO }>("customer", "name email")
    .sort({ lastMessageDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean<ThreadPopulated[]>(); // Use the helper type for the lean result

  const totalCount = await Thread.countDocuments({ user: userId });

  // 2. Use jsonify to ensure Next.js compatibility and cast to the final DTO type
  const serializedThreads = jsonify(threads) as ThreadDTO[];

  return { threads: serializedThreads, totalCount };
}

export async function getTicketDetails(
  threadId: string
): Promise<{ thread: ThreadDTO; messages: MessageDTO[] } | null> {
  await connectToDB();

  // 1. Fetch Thread
  const thread = await Thread.findById(threadId)
    .populate<{ customer: CustomerDTO }>("customer")
    .lean<ThreadPopulated>();

  if (!thread) return null;

  // 2. Fetch Messages
  const messages = await Message.find({ thread: threadId })
    .sort({ date: 1 })
    .lean(); // lean() is enough here

  // 3. Return clean, serialized objects
  return jsonify({
    thread: thread,
    messages: messages,
  });
}
