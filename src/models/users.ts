import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  name: string;
  organization?: string;
  website?: string;
  address?: string;
  passwordHash: string;
  createdAt: Date;
  comparePassword: (candidate: string) => Promise<boolean>;
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
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "users",
  }
);

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
