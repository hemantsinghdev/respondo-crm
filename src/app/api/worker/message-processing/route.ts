import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { processEmailContent } from "@/services/aiServices";
import { saveProcessedMessage } from "@/services/emailServices";
import qstash from "@/lib/qstash";

async function handler(req: NextRequest) {
  console.log(
    "\n[QSTASH-CONSUMER] --- Processing and Summarizing Job Received ---"
  );

  try {
    const payload = await req.json();
    const { messagePayload, userId, isCustomerMessage } = payload;
    const { thread, body, nylasMessageId, ...restOfMessageData } =
      messagePayload;
    console.log(`[JOB] Processing message ID: ${nylasMessageId}`);

    // 1. 🤖 AI Processing (The heavy part)
    const { clean_body, summary } = await processEmailContent(body);

    console.log("[JOB] AI processing complete.");

    // 2. 💾 Database Persistence
    const { messageId, messageSummary } = await saveProcessedMessage({
      thread,
      nylasMessageId,
      body: clean_body,
      summary,
      ...restOfMessageData,
    });

    console.log("[QSTASH-CONSUMER] Job completed successfully.");

    // 3.  Automated Response - Job queue
    if (isCustomerMessage) {
      console.log(`[QSTASH] Enqueuing message automated response task`);

      const automatePayload = {
        userId,
        messageId,
        queryData: messageSummary,
      };

      const response = await qstash.publishJSON({
        url: `${process.env.BASE_URL}/api/worker/auto-response`,
        body: automatePayload,
        retries: 3,
        retryDelay: "40000",
      });

      console.log(`[DEBUG] QStash Response ID: ${response.messageId}`);
    } else {
      console.log(
        `[QSTASH] Skipping Auto-Response, because It is sent be agent.`
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[QSTASH-CONSUMER] Job failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
