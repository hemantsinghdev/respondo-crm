import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { handleMessageCreated } from "@/services/emailServices";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get("challenge");

  if (challenge) {
    console.log("Received Nylas challenge:", challenge);
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "No challenge provided" }, { status: 400 });
}

// Helper to get the correct signature header, regardless of case
const getSignatureHeader = (req: NextRequest): string | null => {
  return (
    req.headers.get("x-nylas-signature") || req.headers.get("X-Nylas-Signature")
  );
};

export async function POST(req: NextRequest) {
  console.log("\n[NYLAS-WEBHOOK] --- Notification POST Received ---");
  try {
    // 1. Get raw body and signature header
    const rawBody = await req.text();
    const signature = getSignatureHeader(req);
    const webhookSecret = process.env.NYLAS_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "[ERROR] NYLAS_WEBHOOK_SECRET is missing. Check environment configuration."
      );
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    if (!signature) {
      console.error("[ERROR] Missing X-Nylas-Signature header.");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // 2. Verify Signature
    // HMAC-SHA256 of the raw body using the webhook secret
    const digest = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (digest !== signature) {
      console.error("[ERROR] Invalid Nylas signature. Request rejected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("[VERIFICATION] Signature matched. Request is authentic.");

    // 3. Parse and Extract Payload (Addressing the nested structure)
    const body = JSON.parse(rawBody);
    const eventContainer = body.data; // The wrapper containing type, source, etc.
    const eventData = eventContainer.object; // The actual message object
    const eventType = body.type;

    console.log(`[EVENT] Processing Event Type: ${eventType}`);
    console.log(`[EVENT] Delivery Attempt: ${body.webhook_delivery_attempt}`);

    // 4. Handle Events
    if (eventType === "message.created") {
      const grantId = eventData.grant_id;
      const messageId = eventData.id;

      console.log(
        `[EVENT] Message Created - Grant ID: ${grantId}, Message ID: ${messageId}`
      );

      if (grantId && messageId) {
        // Run logic asynchronously to not block the 200 OK response

        //TODO MAJOR: Can push this into a dedicated queue like redis/BullMq and give response immediately
        await handleMessageCreated(grantId, messageId).catch((err) =>
          console.error("[BACKGROUND] Processing failed:", err)
        );
      }
    } else {
      console.log(`[EVENT] Ignoring unhandled event type: ${eventType}`);
    }

    // Always respond 200 OK quickly for successful receipt
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[CRITICAL] Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
