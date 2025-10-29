import OpenAI from "openai";

let ai = null;

if (process.env.OPENAI_API_KEY) {
  ai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn("⚠️  OpenAI API 키가 설정되지 않았습니다. OPENAI_API_KEY 환경 변수를 확인하세요.");
}

export default ai;
