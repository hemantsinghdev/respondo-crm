import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  organization?: string;
  website?: string;
  address?: string;
  passwordHash: string;
  nylasGrantId?: string;
  isEmailConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    name: { type: String, required: true },
    organization: { type: String },
    website: { type: String },
    address: { type: String },
    passwordHash: { type: String, required: true },

    nylasGrantId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isEmailConnected: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
