declare module "*.css";
declare module "*.module.css";
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";

import mongoose from "mongoose";

declare global {
  //To Avoid Hot-Reload during development
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}
