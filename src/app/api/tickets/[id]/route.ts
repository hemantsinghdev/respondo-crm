import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDB";
import Ticket from "@/models/ticket";
import Message from "@/models/message";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const ticket = await Ticket.findById(params.id).lean();
  const messages = await Message.find({ ticketId: params.id })
    .sort({ createdAt: 1 })
    .lean();
  if (!ticket)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...ticket, messages });
}
