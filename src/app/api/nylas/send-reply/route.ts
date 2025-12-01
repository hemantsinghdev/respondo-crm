import { connectToDB } from "@/lib/mongoose";
import nylas from "@/lib/nylas";
import { User } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { userId, requestBody } = await req.json();

    if (!userId || !requestBody) {
      return NextResponse.json(
        { error: "Missing userId or requestBody" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select("nylasGrantId");

    const grantId = user?.nylasGrantId;

    if (!grantId) {
      return NextResponse.json(
        { ok: false, error: "Nylas Grant ID not found for the user" },
        { status: 404 }
      );
    }

    const draftResponse = await nylas.drafts.create({
      identifier: grantId,
      requestBody,
    });

    // Extract the Draft ID for sending
    const draftId = draftResponse.requestId;

    if (!draftId) {
      throw new Error("Failed to create message draft in Nylas.");
    }

    const sendResponse = await nylas.drafts.send({
      identifier: grantId,
      draftId: draftId,
    });

    console.log("[NYLAS] Nylas Send Reply succeeded");
    return NextResponse.json(
      {
        ok: true,
        messageId: sendResponse.data.id,
        threadId: sendResponse.data.threadId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[NYLAS] Nylas Send Reply API Error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "An unexpected error occurred during message submission.",
      },
      { status: 500 }
    );
  }
}
