"use server";

import { signOut } from "@/auth";
import { connectToDB } from "@/lib/mongoose";
import { User } from "@/models";
import { revalidatePath } from "next/cache";

interface UpdateProfileState {
  success?: boolean;
  error?: string;
}

export async function handleSignOut() {
  await signOut();
}

export async function updateProfile(
  userId: string,
  formData: FormData
): Promise<UpdateProfileState> {
  try {
    await connectToDB();

    const name = formData.get("name") as string;
    const organization = formData.get("organization") as string;
    const website = formData.get("website") as string;
    const address = formData.get("address") as string;

    await User.findByIdAndUpdate(userId, {
      name,
      organization,
      website,
      address,
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}

export async function disconnectNylas(
  userId: string,
  grantId: string
): Promise<UpdateProfileState> {
  try {
    await connectToDB();

    // 1. Call Nylas API to revoke the grant (Assuming Nylas v3)
    if (grantId) {
      const nylasResponse = await fetch(
        `https://api.us.nylas.com/v3/grants/${grantId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.NYLAS_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!nylasResponse.ok && nylasResponse.status !== 404) {
        console.error("Nylas API Error:", await nylasResponse.text());
      }
    }

    // 2. Update Database
    await User.findByIdAndUpdate(userId, {
      $unset: { nylasGrantId: "" },
      $set: { isEmailConnected: false },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Disconnect error:", error);
    return { error: "Failed to disconnect email provider." };
  }
}

export async function sendPasswordResetEmail(
  email: string
): Promise<UpdateProfileState> {
  try {
    // TODO: Integrate Resend here
    console.log(`Sending password reset to ${email}`);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true };
  } catch (error) {
    return { error: "Failed to send reset email." };
  }
}
