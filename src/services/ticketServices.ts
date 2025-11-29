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

export interface ILeanThread
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

// export async function getTicketDetails(threadId: string) {
//   await connectToDB();

//   const thread = (await Thread.findById(threadId)
//     .populate("customer")
//     .lean()) as ILeanThread & { __v: number };

//   if (!thread) return null;

//   const messages = (await Message.find({ thread: threadId })
//     .sort({ date: 1 })
//     .lean()) as unknown as ILeanMessage[];

//   // Serialize
//   return {
//     thread: {
//       ...thread,
//       _id: thread._id.toString(),
//       user: thread.user.toString(),
//       customer: { ...thread.customer, _id: thread.customer._id.toString() },
//       lastMessageDate: thread.lastMessageDate.toISOString(),
//     },
//     messages: messages.map((m) => ({
//       ...m,
//       _id: m._id.toString(),
//       thread: m.thread.toString(),
//       date: m.date.toISOString(),
//     })),
//   };
// }

// services/ticketServices.ts  (or wherever getTicketDetails lives)
export async function getTicketDetails(threadId: string) {
  await connectToDB();

  try {
    const threadDoc = (await Thread.findById(threadId)
      .populate("customer")
      .lean()) as (ILeanThread & { __v?: number; customer?: any }) | null;

    if (!threadDoc) return null;

    const messagesDocs = (await Message.find({ thread: threadId })
      .sort({ date: 1 })
      .lean()) as any[];

    // Helper to safely convert a Date-like to ISO string
    const toISO = (d: any) => {
      if (!d) return new Date().toISOString();
      if (typeof d === "string") return d;
      if (d instanceof Date) return d.toISOString();
      if (d.toISOString) return d.toISOString();
      return String(d);
    };

    // Serialize the thread and its populated customer
    const thread = {
      ...threadDoc,
      _id: threadDoc._id?.toString?.() ?? String(threadDoc._id ?? ""),
      user: threadDoc.user?.toString?.() ?? String(threadDoc.user ?? ""),
      customer: threadDoc.customer
        ? {
            _id:
              threadDoc.customer._id?.toString?.() ??
              String(threadDoc.customer._id ?? ""),
            name: threadDoc.customer.name ?? "",
            email: threadDoc.customer.email ?? "",
          }
        : null,
      lastMessageDate: toISO(threadDoc.lastMessageDate),
    };

    // Serialize messages (ensure plain objects only)
    const messages = messagesDocs.map((m) => {
      // normalize participants arrays
      const normalizePeople = (arr: any[] | undefined) =>
        (arr || []).map((p) => ({
          name: p?.name ?? "",
          email: p?.email ?? "",
        }));

      const normalizedAttachments = (m.attachments || []).map((a: any) => ({
        id: a?.id != null ? String(a.id) : "",
        filename: a?.filename ?? "",
        contentType: a?.contentType ?? "",
        size: typeof a?.size === "number" ? a.size : Number(a?.size ?? 0),
        contentId: a?.contentId ?? "",
      }));

      return {
        ...m,
        _id: m._id?.toString?.() ?? String(m._id ?? ""),
        thread: m.thread?.toString?.() ?? String(m.thread ?? ""),
        date: toISO(m.date),
        from: normalizePeople(m.from),
        to: normalizePeople(m.to),
        cc: normalizePeople(m.cc),
        bcc: normalizePeople(m.bcc),
        attachments: normalizedAttachments,
        // If there are fields you explicitly don't want to send to the client, omit them here
      };
    });

    return { thread, messages };
  } catch (err) {
    // You may want to log this in your real logger
    console.error("getTicketDetails error:", err);
    return null;
  }
}
