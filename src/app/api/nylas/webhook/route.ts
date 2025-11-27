import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { handleMessageCreated } from "@/services/emailService";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get("challenge");

  if (challenge) {
    console.log("Received Nylas challenge:", challenge);
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "No challenge provided" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-nylas-signature") ||
      req.headers.get("X-Nylas-Signature");
    const webhookSecret = process.env.NYLAS_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("NYLAS_WEBHOOK_SECRET is missing");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // 1. Verify Signature
    // HMAC-SHA256 of the raw body using the webhook secret
    const digest = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (digest !== signature) {
      console.error("Invalid Nylas signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Parse Body
    const body = JSON.parse(rawBody);
    const { type, data } = body;

    console.log(`Received Nylas Webhook: ${type}`);

    // 3. Handle Events
    // Nylas v3 structure usually puts the payload in `data` and the event type in `type`
    // Note: Nylas webhooks can be batched or single. Check documentation for your specific version.

    if (type === "message.created") {
      const grantId = data.grant_id;
      const messageId = data.object.id; // Or data.id depending on exact trigger version

      if (grantId && messageId) {
        // Run logic asynchronously to not block the webhook response
        // In production, use a queue (Redis/BullMQ). For simple use, simple async call:
        handleMessageCreated(grantId, messageId).catch((err) =>
          console.error("Background processing failed:", err)
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
