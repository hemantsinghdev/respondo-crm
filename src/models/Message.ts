import mongoose, { Schema, Document, Model } from "mongoose";

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
    subject: { type: String },
    snippet: { type: String },
    body: { type: String },
    date: { type: Date, required: true },
  },
  { collection: "messages", timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
