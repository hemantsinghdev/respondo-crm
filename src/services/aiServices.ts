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

const faqSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      question: {
        type: "string",
        description: "The cleaned, standalone question text.",
      },
      answer: {
        type: "string",
        description: "The complete, corresponding answer text.",
      },
    },
    required: ["question", "answer"],
  },
};

export async function processEmailContent(rawHtmlBody: string) {
  try {
    const prompt = `
      You are an expert email parser. 
      Input: A raw HTML email body containing a thread history.
      
      Task:
      1. Extract ONLY the newest message. Remove all quoted text (e.g., "On [Date] wrote:", ">"). Convert this content to **strict plain text**, ensuring all HTML tags are completely removed.
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
      throw new Error("Unable to Get Response From Gemini");
    }
  } catch (error) {
    console.error("[GEMINI] Error processing email:", error);
    return { clean_body: rawHtmlBody, summary: "Summary unavailable" };
  }
}

export async function parseFileContent(fileContent: string) {
  try {
    const prompt = `
      Analyze the following raw text content, and extract the content into a structured JSON array of objects. Each object MUST have a 'question' property and an 'answer' property. Ignore any introductory or extraneous text.
    `;

    const result = await ai.generateContent({
      model: GEMINI_MODEL,
      contents: [prompt, fileContent],
      config: {
        responseMimeType: "application/json",
        responseSchema: faqSchema,
      },
    });

    const response = result.text;
    console.log("this is the response: ", response);
    if (response) {
      return JSON.parse(response);
    } else {
      throw new Error("Unable to Get Response From Gemini");
    }
  } catch (error) {
    console.error("[GEMINI] Error processing email:", error);
    return [];
  }
}
