import { NextResponse } from "next/server";
import nylas from "@/lib/nylas";
import { connectToDB } from "@/lib/mongoose";
import { User } from "@/models";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code || !userId) {
    return NextResponse.redirect(
      new URL("/?status=error&message=nylas_error_occured", request.url)
    );
  }

  try {
    const tokenExchangeResponse = await nylas.auth.exchangeCodeForToken({
      clientId: process.env.NYLAS_CLIENT_ID!,
      redirectUri: process.env.NYLAS_REDIRECT_URI!,
      code: code,
    });

    console.log(
      `\nSuccessfully exchanged code for grantId: ${tokenExchangeResponse.grantId}`
    );
    const grantId = tokenExchangeResponse.grantId;

    await connectToDB();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { nylasGrantId: grantId, isEmailConnected: true } },
      { new: true }
    );

    if (!updatedUser) {
      console.error(`User not found for ID: ${userId}`);
      return NextResponse.redirect(
        new URL("/?status=error&message=user_not_updated", request.url)
      );
    }

    console.log(`\nUser ${userId} updated successfully with new grantId.`);

    return NextResponse.redirect(new URL("/?status=success", request.url));
  } catch (error) {
    console.error("Error exchanging code for token or updating user:", error);
    return NextResponse.redirect(
      new URL("/?status=error&message=auth_failed", request.url)
    );
  }
}
