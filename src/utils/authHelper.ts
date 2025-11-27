import clientPromise from "@/lib/mongoDB";
import { connectToDB } from "@/lib/mongoose";
import { compare } from "bcryptjs";
import { User } from "@/models";

export async function getUserByEmail(email: string) {
  try {
    await connectToDB();

    const user = await User.findOne({
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
