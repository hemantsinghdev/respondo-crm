// models/organization.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IOrganization {
  name: string;
  domain?: string;
  createdAt?: Date;
}

const OrgSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  domain: String,
  createdAt: { type: Date, default: Date.now },
});

export default models.Organization ||
  model<IOrganization>("Organization", OrgSchema);
