"use server";

import { ingestFaqData } from "@/services/vectorServices";
import { parseFileContent } from "@/services/aiServices";
import { setFaqUploaded } from "./user";
import { extractTextFromFile } from "@/utils/fileProcessor";
import vectorIndex from "@/lib/vectorIndex";

type IngestionResult = {
  success: boolean;
  message: string;
};

export async function processAndIngestData(
  userId: string,
  file: File
): Promise<IngestionResult> {
  let parsedData: any;
  console.log("[Ingestion] Request Received.");
  try {
    let fileContent: string;
    try {
      fileContent = await extractTextFromFile(file);
    } catch (e) {
      console.log("[Ingestion] Not able to parse the file");
      const errorMessage =
        e instanceof Error ? e.message : "File extraction failed.";
      return {
        success: false,
        message: `File processing error: ${errorMessage}`,
      };
    }

    if (fileContent.length === 0) {
      console.log("[Ingestion] file is empty");
      return { success: false, message: "Extracted file content is empty." };
    }

    console.log("[Ingestion] file Content are : ", fileContent);

    parsedData = await parseFileContent(fileContent);

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      return {
        success: false,
        message:
          "Ingestion failed: Gemini found no valid Q&A pairs in the file.",
      };
    }
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown parsing error occurred.";
    return {
      success: false,
      message: `Parsing failed: ${errorMessage}`,
    };
  }

  // 2. Ingest the structured data into Upstash Vector (Server-side)
  try {
    await ingestFaqData(userId, parsedData);
    await setFaqUploaded(userId, true);
    return {
      success: true,
      message: `Success! ${parsedData.length} Q&A pairs have been processed, embedded, and stored.`,
    };
  } catch (error) {
    console.error("Upstash Ingestion Error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown parsing error occurred.";
    return {
      success: false,
      message: `Ingestion failed due to a database error: ${errorMessage}`,
    };
  }
}

export async function deleteKnowledgeBase(userId: string) {
  try {
    const responseReset = await vectorIndex.reset({ namespace: userId });

    if (responseReset === "Success") {
      await setFaqUploaded(userId, false);
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    throw error;
  }
}
