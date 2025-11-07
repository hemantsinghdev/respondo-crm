import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDB";
import Ticket from "@/models/ticket";

export async function GET() {
  await dbConnect();
  const tickets = await Ticket.find({}).limit(50).lean();
  return NextResponse.json(tickets);
}
