import { GoogleGenAI } from "@google/genai";

// Google GenAI 클라이언트를 선택적으로 초기화 (API 키가 없으면 null)
let ai = null;

if (process.env.GOOGLE_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });
  } catch (error) {
    console.warn("Google API key is invalid. Google GenAI features will be disabled.");
    ai = null;
  }
} else {
  console.warn("GOOGLE_API_KEY is not set. Google GenAI features will be disabled.");
}

export default ai;
