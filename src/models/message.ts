// models/message.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IMessage {
  ticketId: string;
  fromEmail: string;
  toEmail?: string;
  bodyText?: string;
  html?: string;
  attachments?: { filename: string; data?: string; mimeType?: string }[];
  createdAt?: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    ticketId: { type: String, required: true },
    fromEmail: { type: String, required: true },
    toEmail: String,
    bodyText: String,
    html: String,
    attachments: [{ filename: String, mimeType: String, data: String }],
  },
  { timestamps: true }
);

export default models.Message || model<IMessage>("Message", MessageSchema);
