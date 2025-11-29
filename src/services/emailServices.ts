import { connectToDB } from "@/lib/mongoose";
import nylas from "@/lib/nylas";
import qstash from "@/lib/qstash";
import { User, Thread, Message, Customer } from "@/models";
import { IMessage } from "@/models/Message";

export async function handleMessageCreated(
  grantId: string,
  nylasMessageId: string
) {
  await connectToDB();

  console.log(
    `\n[SERVICE] Starting message.created processing for Grant ID: ${grantId}`
  );

  // 1. Find the System User associated with this Nylas Grant
  console.log(`[DB] Searching for User with nylasGrantId: ${grantId}`);
  const user = await User.findOne({ nylasGrantId: grantId });
  if (!user) {
    console.error(`[DB] No User found for grantId: ${grantId}. Aborting.`);
    return;
  }
  console.log(`[DB] Found User: ${user.email} (ID: ${user._id})`);

  try {
    // 2. Fetch full message details from Nylas
    console.log(
      `[NYLAS API] Fetching full message details for ID: ${nylasMessageId}`
    );
    const messageResponse = await nylas.messages.find({
      identifier: grantId,
      messageId: nylasMessageId,
    });

    const msg = messageResponse.data;
    if (!msg) {
      console.error(
        "[NYLAS API] Message details could not be retrieved. Aborting."
      );
      return;
    }
    console.log(`[NYLAS API] Successfully retrieved message: "${msg}"`);

    // 3. Identify the "Customer" (The participant who is NOT the CRM User)
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
        "[CUSTOMER] Could not identify a customer participant (likely internal email or mailing list). Skipping customer logic."
      );
      return;
    }

    const customerEmail = customerParticipant.email.toLowerCase();
    const customerName =
      customerParticipant.name || customerEmail.split("@")[0];

    console.log(`[CUSTOMER] Identified potential customer: ${customerEmail}`);

    // 4. Find or Create Customer
    console.log(`[DB] Searching for Customer: ${customerEmail}`);
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
      console.log(
        `[DB] Created new Customer: ${customer.email} (ID: ${customer._id})`
      );
    } else {
      console.log(
        `[DB] Found existing Customer: ${customer.email} (ID: ${customer._id})`
      );
    }

    // 5. Find or Create Thread
    console.log(
      `[DB] Searching for Thread with nylasThreadId: ${msg.threadId}`
    );
    let thread = await Thread.findOne({ nylasThreadId: msg.threadId });

    const messageDate = new Date(msg.date * 1000); // Nylas sends unix timestamp

    if (!thread) {
      thread = await Thread.create({
        user: user._id,
        customer: customer._id,
        nylasThreadId: msg.threadId,
        subject: msg.subject,
        snippet: msg.snippet,
        lastMessageDate: messageDate,
        participantEmails: allParticipants.map((p) => p.email),
        isUnread: msg.unread,
      });
      console.log(
        `[DB] Created new Thread (ID: ${thread._id}) for subject: "${thread.subject}"`
      );
    } else {
      // Update existing thread details
      thread.snippet = msg.snippet || thread.snippet;
      thread.lastMessageDate = messageDate;
      thread.isUnread = msg.unread || true; // Mark unread on new message
      await thread.save();
      console.log(
        `[DB] Updated existing Thread (ID: ${thread._id}). New snippet: "${thread.snippet}"`
      );
    }

    // 6. Process Message
    console.log(
      `[DB] Checking for existing Message with nylasMessageId: ${msg.id}`
    );
    const existingMessage = await Message.findOne({ nylasMessageId: msg.id });

    if (!existingMessage) {
      console.log(
        `[QSTASH] Enqueuing message processing task for ID: ${msg.id}`
      );

      const payload = {
        thread: thread._id,
        nylasMessageId: msg.id,
        from: msg.from,
        to: msg.to,
        cc: msg.cc,
        bcc: msg.bcc,
        subject: msg.subject,
        snippet: msg.snippet,
        body: msg.body,
        attachments: msg.attachments,
        date: messageDate,
      };

      const response = await qstash.publishJSON({
        url: `${process.env.BASE_URL}/api/worker/message-processing`,
        body: payload,
        retries: 3,
        retryDelay: "40000",
      });

      // 2. LOG THE RESPONSE FROM QSTASH
      console.log(`[DEBUG] QStash Response ID: ${response.messageId}`);
    } else {
      console.log(`[DB] Message ${msg.id} already exists. Skipping save.`);
    }
  } catch (error) {
    console.error("[CRITICAL] Error processing Nylas webhook message:", error);
  }
}

export async function saveProcessedMessage(payload: IMessage) {
  await connectToDB();

  await Message.create(payload);

  console.log(
    `[DB] Saved new Message (ID: ${payload.nylasMessageId}) to Thread ${payload.thread}.`
  );
}
