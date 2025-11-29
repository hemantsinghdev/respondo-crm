import { ai, GEMINI_MODEL } from "@/lib/googleAI";

const emailSchema = {
  type: "object",
  properties: {
    clean_body: {
      type: "string",
      description:
        "The newest message content only, converted to clean HTML. Remove quoted replies, previous threads, and signatures.",
    },
    summary: {
      type: "string",
      description: "A concise 1-2 sentence summary of the newest message.",
    },
  },
  required: ["clean_body", "summary"],
};

export async function processEmailContent(rawHtmlBody: string) {
  try {
    const prompt = `
      You are an expert email parser. 
      Input: A raw HTML email body containing a thread history.
      
      Task:
      1. Extract ONLY the newest message. Remove all quoted text (e.g., "On [Date] wrote:", ">").
      2. Remove standard signatures (e.g., "Best regards, Name").
      3. Summarize the main point of this specific new message.
      
      Return JSON.
    `;

    const result = await ai.generateContent({
      model: GEMINI_MODEL,
      contents: [prompt, rawHtmlBody],
      config: {
        responseMimeType: "application/json",
        responseSchema: emailSchema,
      },
    });

    const response = result.text;

    if (response) {
      return JSON.parse(response);
    } else {
      new Error("Unable to Get Response From Gemini");
    }
  } catch (error) {
    console.error("[GEMINI] Error processing email:", error);
    return { clean_body: rawHtmlBody, summary: "Summary unavailable" };
  }
}
