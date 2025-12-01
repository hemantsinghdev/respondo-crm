import vectorIndex from "@/lib/vectorIndex";

type ParsedFAQ = {
  question: string;
  answer: string;
};

export async function ingestFaqData(userId: string, faqData: ParsedFAQ[]) {
  console.log("[UPSTASH VECTOR] Ingestion request received for Faq Data");
  if (faqData.length === 0) {
    console.log("[UPSTASH VECTOR] No Faq Data present");
    return { success: false, message: "No valid Q&A pairs to ingest." };
  }

  // 1. Map the parsed data into the format required by Upstash's upsert command.
  const vectorsToUpsert = faqData.map((item, index) => {
    const id = `faq-${Date.now()}-${index}`;

    const data = `Question: ${item.question}\nAnswer: ${item.answer}`;

    const metadata = {
      question: item.question,
      answer: item.answer,
    };

    return { id, data, metadata };
  });

  try {
    // 2. Perform a batch upsert. CRITICAL: Use the userId as the namespace.
    const result = await vectorIndex.upsert(vectorsToUpsert, {
      namespace: userId,
    });

    console.log(
      `[UPSTASH VECTOR] Upstash Ingestion Result for user ${userId}:`,
      result
    );
    return {
      success: true,
      message: `${vectorsToUpsert.length} vectors successfully added to namespace ${userId}.`,
    };
  } catch (error) {
    console.error(
      `[UPSTASH VECTOR] Error ingesting data for user ${userId}:`,
      error
    );
    throw new Error("Upstash ingestion failed.");
  }
}
