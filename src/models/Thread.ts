import mongoose, { Schema, Document, Model } from "mongoose";

export interface IThread extends Document {
  user: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  nylasThreadId: string;
  subject: string;
  snippet: string;
  lastMessageDate: Date;
  lastMessageId: string;
  participantEmails: string[];
  customerParticipant: {
    name: string;
    email: string;
  };
  isUnread: boolean;
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSchema = new Schema<IThread>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    nylasThreadId: { type: String, required: true, unique: true },
    subject: { type: String },
    snippet: { type: String },
    lastMessageDate: { type: Date, required: true },
    lastMessageId: { type: String, required: true },
    participantEmails: [{ type: String }],
    customerParticipant: {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    isUnread: { type: Boolean, default: false },
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { collection: "threads", timestamps: true }
);

const Thread =
  mongoose.models.Thread || mongoose.model<IThread>("Thread", ThreadSchema);

export default Thread;
