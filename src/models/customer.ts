// models/customer.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface ICustomer {
  email: string;
  name?: string;
  phone?: string;
  metadata?: any;
  organizationId: string;
  createdAt?: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  email: { type: String, required: true },
  name: String,
  phone: String,
  metadata: Schema.Types.Mixed,
  organizationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

CustomerSchema.index({ email: 1, organizationId: 1 }, { unique: true });

export default models.Customer || model<ICustomer>("Customer", CustomerSchema);
