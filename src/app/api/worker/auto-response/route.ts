import { connectToDB } from "@/lib/mongoose";
import vectorIndex from "@/lib/vectorIndex";
import { Message } from "@/models";
import { generateResponse } from "@/services/aiServices";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest) {
  console.log("\n[QSTASH-CONSUMER] --- Automated Response Job Received ---");

  try {
    const payload = await req.json();
    const { userId, messageId, queryData } = payload;

    //1. Retrieving Context
    console.log("\n[JOB] Retrieving context");

    const retrievalQuery = {
      topK: 5,
      data: queryData,
      includeMetadata: true,
    };

    const retrievedResponse = await vectorIndex.query(retrievalQuery, {
      namespace: userId,
    });

    console.log("\n[JOB] Response received");

    const relevantContext = retrievedResponse
      .filter((res) => res.metadata) // Only keep results with metadata
      .map((res) => res.metadata);

    if (relevantContext.length === 0) {
      console.log("[JOB] No relevant context found.");
      throw new Error("No Response received from AI.");
    }

    // 2. Generating Response
    console.log("\n[JOB] Providing Query and Content to AI");

    const contextString = relevantContext
      .map(
        (entry: any, index: number) =>
          `[${index + 1}] Q: ${entry.question}\n    A: ${entry.answer}`
      )
      .join("\n\n");

    const response = await generateResponse(contextString, queryData);

    // 3. Saving the response
    if (response) {
      console.log("[JOB] Response Received. Saving the response.");
      await connectToDB();

      await Message.findByIdAndUpdate(messageId, {
        $set: { response: response },
      });
    } else {
      throw new Error("No Response received from AI.");
    }
    //--------------
    return NextResponse.json(
      { message: "Automated Response Saved Successfully", success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("[JOB] An Error Occured During Automated Response Job", err);
    const errorMessage =
      err instanceof Error ? err.message : "Some error occured";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export const POST = verifySignatureAppRouter(handler);
