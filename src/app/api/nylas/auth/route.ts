import { NextResponse } from "next/server";
import nylas from "@/lib/nylas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user_id for state parameter" },
        { status: 400 }
      );
    }

    const authUrl = nylas.auth.urlForOAuth2({
      clientId: process.env.NYLAS_CLIENT_ID!,
      redirectUri: process.env.NYLAS_REDIRECT_URI!,
      scope: ["email.read_only", "email.send"],
      accessType: "offline", // Request a refresh token (needed for long-lived access)
      state: userId, // Pass your user ID here
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error starting Nylas OAuth flow:", error);
    return NextResponse.json(
      { error: "Failed to start authentication" },
      { status: 500 }
    );
  }
}
