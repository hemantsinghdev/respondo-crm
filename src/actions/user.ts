"use server";

import { connectToDB } from "@/lib/mongoose";
import { User } from "@/models";

export async function getFaqUploadStatus(userId: string): Promise<boolean> {
  try {
    await connectToDB();

    const user = await User.findById(userId).select("faqUploaded");

    if (!user) {
      return false;
    }

    return user.faqUploaded ?? false;
  } catch (error) {
    console.error("Database error fetching FAQ status:", error);
    return false;
  }
}

export async function setFaqUploaded(
  userId: string,
  status: boolean
): Promise<void> {
  try {
    await connectToDB();

    await User.findByIdAndUpdate(userId, { $set: { faqUploaded: status } });
    console.log(`User ${userId} faqUploaded status set to ${status}.`);
  } catch (error) {
    console.error(
      `Database error updating FAQ status for user ${userId}:`,
      error
    );
    throw new Error("Failed to update user's FAQ status in the database.");
  }
}
