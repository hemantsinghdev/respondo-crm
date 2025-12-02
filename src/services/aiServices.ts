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
    console.log("[GEMINI] Processing Email Content request received.");
    const prompt = `
      You are an expert email parser. 
      Input: A raw HTML email body containing a thread history.
      
      Task:
      1. Extract ONLY the newest message. Remove all quoted text (e.g., "On [Date] wrote:", ">"). Convert this content to **strict plain text**, ensuring all HTML tags are completely removed.
      2. Remove standard signatures (e.g., "Best regards, Name").
      3. Summarize the main point of this message. **if needed**, add context from older messages and quoted text.
      
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
    console.log("[GEMINI]this is the response: ", response);
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
    console.log("[GEMINI] Parsing File Content request received.");
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
    console.log("[GEMINI]this is the response: ", response);
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

export async function generateResponse(context: string, query: string) {
  try {
    console.log("[GEMINI] Automate Response Generation request received.");
    const systemPrompt = `
    You are a helpful and polite customer support AI agent.
    Your goal is to answer the user's question based strictly on the provided context (Knowledge Base).

    Guidelines:
    1. Answer the question directly using the information below.
    2. Tone: Professional, empathetic, and concise.
    3. If the Context does not contain the answer, strictly reply: "I'm sorry, I couldn't find specific information regarding your query in our documentation. A human agent will review this shortly."
    4. Do not invent facts outside of the provided context.

    Knowledge Base Context:
    ${context}
    `;

    const userPrompt = `User Question: "${query}"`;

    const result = await ai.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] },
      ],
    });

    const response = result.text;
    console.log("[GEMINI]this is the response: ", response);
    if (response) {
      return response;
    } else {
      throw new Error("Unable to Get Response From Gemini");
    }
  } catch (err) {
    console.error("[GEMINI] Error processing email:", err);
    return null;
  }
}
