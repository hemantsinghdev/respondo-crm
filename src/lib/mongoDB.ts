import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("Please set MONGODB_URI");

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // 👇 ADD THIS OPTION
  family: 4, // Force IPv4 to avoid querySrv ENOTFOUND errors
};

global._mongoClientPromise =
  global._mongoClientPromise || new MongoClient(uri, options).connect();

export default global._mongoClientPromise;
