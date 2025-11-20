import { connectToDB } from "@/lib/mongoose";
import User from "@/models/users";

export async function isEmailConnected(userId: string) {
  try {
    await connectToDB();
    const user = await User.findById(userId).select("isEmailConnected");

    if (!user) {
      throw new Error("User not found.");
    }

    return user.isEmailConnected;
  } catch (error) {
    console.error("Error fetching user connection status:", error);
    return false;
  }
}
