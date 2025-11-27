import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  user: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    name: { type: String },
  },
  { timestamps: true }
);

// Ensure a user doesn't have duplicate customers with same email
CustomerSchema.index({ user: 1, email: 1 }, { unique: true });

const Customer =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
