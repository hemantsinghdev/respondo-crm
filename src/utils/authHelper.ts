import clientPromise from "@/lib/mongoDB";
import { connectToDB } from "@/lib/mongoose";
import { compare } from "bcryptjs";
import users from "@/models/users";

// export async function getUserByEmail(email: string) {
//   try {
//     const client = await clientPromise;
//     const db = client.db("Respondo");
//     const usersCollection = db.collection("users");
//     const user = await usersCollection.findOne({ email: email.toLowerCase() });
//     return user;
//   } catch (error) {
//     console.error("Error fetching user by email:", error);
//     return null;
//   }
// }

export async function getUserByEmail(email: string) {
  try {
    await connectToDB();

    const user = await users.findOne({
      email: email.toLowerCase(),
    });

    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}
