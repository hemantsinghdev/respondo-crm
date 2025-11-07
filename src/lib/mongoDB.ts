import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("Please set MONGODB_URI");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // in dev use a global to avoid recreation across HMR
  (global as any)._mongoClientPromise =
    (global as any)._mongoClientPromise || new MongoClient(uri).connect();
  clientPromise = (global as any)._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export default clientPromise;
