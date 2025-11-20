import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("Please set MONGODB_URI");

global._mongoClientPromise =
  global._mongoClientPromise || new MongoClient(uri).connect();

export default global._mongoClientPromise;
