import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { processEmailContent } from "@/services/aiServices";
import { saveProcessedMessage } from "@/services/emailServices";

async function handler(req: NextRequest) {
  console.log("\n[QSTASH-CONSUMER] --- Job Received ---");

  try {
    const payload = await req.json();
    const { thread, body, nylasMessageId, ...restOfMessageData } = payload;
    console.log(`[JOB] Processing message ID: ${nylasMessageId}`);

    // 1. 🤖 AI Processing (The heavy part)
    const { clean_body, summary } = await processEmailContent(body);

    console.log("[JOB] AI processing complete.");

    // 2. 💾 Database Persistence
    await saveProcessedMessage({
      thread,
      nylasMessageId,
      body: clean_body,
      summary,
      ...restOfMessageData,
    });

    console.log("[QSTASH-CONSUMER] Job completed successfully.");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[QSTASH-CONSUMER] Job failed:", error);
    //  Return a non-200 status code to trigger QStash retry mechanism
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
