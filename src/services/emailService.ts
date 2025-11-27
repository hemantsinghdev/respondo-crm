import { connectToDB } from "@/lib/mongoose";
import nylas from "@/lib/nylas";
import { User, Thread, Message, Customer } from "@/models";
import mongoose from "mongoose";

export async function handleMessageCreated(
  grantId: string,
  nylasMessageId: string
) {
  await connectToDB();

  console.log(`Processing message.created for grant ${grantId}`);

  // 1. Find the System User associated with this Nylas Grant
  const user = await User.findOne({ nylasGrantId: grantId });
  if (!user) {
    console.error(`No user found for grantId: ${grantId}`);
    return;
  }

  try {
    // 2. Fetch full message details from Nylas
    // The webhook only gives us the ID, we need the body, subject, etc.
    const messageResponse = await nylas.messages.find({
      identifier: grantId,
      messageId: nylasMessageId,
    });

    const msg = messageResponse.data;
    if (!msg) return;

    // 3. Identify the "Customer"
    // The "Customer" is the person who is NOT the CRM User.
    // We check the 'from' and 'to' fields.
    // Note: This logic assumes 1-on-1 conversations. For multi-party, you might pick the first non-user.

    const allParticipants = [
      ...(msg.from || []),
      ...(msg.to || []),
      ...(msg.cc || []),
    ];

    // Find a participant that is NOT the current user
    const customerParticipant = allParticipants.find(
      (p) => p.email && p.email.toLowerCase() !== user.email.toLowerCase()
    );

    if (!customerParticipant || !customerParticipant.email) {
      console.log(
        "Could not identify a customer participant (internal email?)"
      );
      return;
    }

    const customerEmail = customerParticipant.email.toLowerCase();
    const customerName =
      customerParticipant.name || customerEmail.split("@")[0];

    // 4. Find or Create Customer
    let customer = await Customer.findOne({
      user: user._id,
      email: customerEmail,
    });

    if (!customer) {
      customer = await Customer.create({
        user: user._id,
        email: customerEmail,
        name: customerName,
      });
      console.log(`Created new customer: ${customerEmail}`);
    }

    // 5. Find or Create Thread
    // We use the Nylas Thread ID to sync contexts
    let thread = await Thread.findOne({ nylasThreadId: msg.threadId });

    if (!thread) {
      thread = await Thread.create({
        user: user._id,
        customer: customer._id,
        nylasThreadId: msg.threadId,
        subject: msg.subject,
        snippet: msg.snippet,
        lastMessageDate: new Date(msg.date * 1000), // Nylas sends unix timestamp
        participantEmails: allParticipants.map((p) => p.email),
        isUnread: msg.unread,
      });
    } else {
      // Update existing thread details
      thread.snippet = msg.snippet || thread.snippet;
      thread.lastMessageDate = new Date(msg.date * 1000);
      thread.isUnread = msg.unread || true; // Mark unread on new message
      await thread.save();
    }

    // 6. Save Message
    // Check if message already exists to be idempotent
    const existingMessage = await Message.findOne({ nylasMessageId: msg.id });

    if (!existingMessage) {
      await Message.create({
        thread: thread._id,
        nylasMessageId: msg.id,
        from: msg.from,
        to: msg.to,
        cc: msg.cc,
        bcc: msg.bcc,
        subject: msg.subject,
        snippet: msg.snippet,
        body: msg.body,
        date: new Date(msg.date * 1000),
      });
      console.log(`Saved message ${msg.id} to thread ${thread._id}`);
    }
  } catch (error) {
    console.error("Error processing Nylas webhook message:", error);
  }
}
