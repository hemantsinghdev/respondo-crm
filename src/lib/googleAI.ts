import { GoogleGenAI } from "@google/genai";
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const GEMINI_MODEL = "gemini-2.5-flash";
export const EMBEDDING_MODEL = "text-embedding-004";

export const ai = genAI.models;
