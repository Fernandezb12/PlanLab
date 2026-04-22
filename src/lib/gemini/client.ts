import { GoogleGenAI } from "@google/genai";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

let geminiClient: GoogleGenAI | null = null;

const getGeminiApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Falta configurar GEMINI_API_KEY en el entorno del servidor.");
  }

  return apiKey;
};

export const getGeminiClient = () => {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  }

  return geminiClient;
};

export const getGeminiModel = () => process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
