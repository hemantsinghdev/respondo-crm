// models/user.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  email: string;
  name?: string;
  role: "ADMIN" | "AGENT" | "VIEWER";
  organizationId: string;
  createdAt?: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: String,
  role: { type: String, enum: ["ADMIN", "AGENT", "VIEWER"], default: "AGENT" },
  organizationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.User || model<IUser>("User", UserSchema);
