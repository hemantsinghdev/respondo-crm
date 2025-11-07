import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDB";
import Customer from "@/models/customer";
import Ticket from "@/models/ticket";
import Message from "@/models/message";

export async function POST(request: Request) {
  // validate webhook secret (simple)
  const secret = request.headers.get("x-inbound-secret");
  if (secret !== process.env.INBOUND_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await request.json();
  // payload should contain: from, to, subject, text, html
  const { from, subject, text } = payload;
  await dbConnect();

  let customer = await Customer.findOne({ email: from });
  if (!customer) {
    customer = await Customer.create({
      email: from,
      organizationId: payload.organizationId || "default",
    });
  }

  const ticket = await Ticket.create({
    organizationId: customer.organizationId,
    customerId: customer._id,
    subject: subject || "No subject",
    body: text || "",
    channel: "EMAIL",
  });

  await Message.create({
    ticketId: ticket._id,
    fromEmail: from,
    bodyText: text,
  });

  // TODO: enqueue AI summarization job
  return NextResponse.json({ ok: true, ticketId: ticket._id });
}
