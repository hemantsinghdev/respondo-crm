import mongoose, { Schema, Document, Model } from "mongoose";
import { Attachment } from "nylas";

export interface IMessage extends Document {
  thread: mongoose.Types.ObjectId;
  nylasMessageId: string;
  from: { name: string; email: string }[];
  to: { name: string; email: string }[];
  cc: { name: string; email: string }[];
  bcc: { name: string; email: string }[];
  subject: string;
  snippet: string;
  body: string;
  summary: string;
  response?: string;
  attachments: Attachment[];
  date: Date;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    thread: {
      type: Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
      index: true,
    },
    nylasMessageId: { type: String, required: true, unique: true },
    from: [{ name: String, email: String }],
    to: [{ name: String, email: String }],
    cc: [{ name: String, email: String }],
    bcc: [{ name: String, email: String }],
    subject: { type: String, required: true },
    snippet: { type: String, required: true },
    summary: { type: String, required: true },
    response: { type: String },
    body: { type: String, required: true },
    attachments: [
      {
        id: String,
        filename: String,
        contentType: String,
        size: Number,
        contentId: String,
      },
    ],
    date: { type: Date, required: true },
  },
  { collection: "messages", timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
