import { GoogleGenAI } from "@google/genai";

let ai = null;

if (process.env.GOOGLE_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
  });
} else {
  console.warn("⚠️  Google GenAI API 키가 설정되지 않았습니다. GOOGLE_API_KEY 환경 변수를 확인하세요.");
}

export default ai;
