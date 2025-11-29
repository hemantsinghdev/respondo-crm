import { GoogleGenAI } from "@google/genai";
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash";
const EMBEDDING_MODEL = "text-embedding-004";

const ai = genAI.models;
