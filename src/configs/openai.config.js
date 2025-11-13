import OpenAI from "openai";

// OpenAI 클라이언트를 선택적으로 초기화 (API 키가 없으면 null)
let ai = null;

if (process.env.OPENAI_API_KEY) {
  try {
    ai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.warn("OpenAI API key is invalid. OpenAI features will be disabled.");
    ai = null;
  }
} else {
  console.warn("OPENAI_API_KEY is not set. OpenAI features will be disabled.");
}

export default ai;
