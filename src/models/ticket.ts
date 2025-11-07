// models/ticket.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface ITicket {
  organizationId: string;
  customerId?: string;
  subject: string;
  body?: string;
  status?: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string;
  tags?: string[];
  channel?: "EMAIL" | "CHAT" | "WHATSAPP";
  createdAt?: Date;
  updatedAt?: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    organizationId: { type: String, required: true },
    customerId: String,
    subject: String,
    body: String,
    status: {
      type: String,
      enum: ["OPEN", "PENDING", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    assigneeId: String,
    tags: [String],
    channel: {
      type: String,
      enum: ["EMAIL", "CHAT", "WHATSAPP"],
      default: "EMAIL",
    },
  },
  { timestamps: true }
);

export default models.Ticket || model<ITicket>("Ticket", TicketSchema);
