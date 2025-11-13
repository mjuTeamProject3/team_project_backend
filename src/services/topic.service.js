import { genaiClient, genaiModels } from "../utils/genai.util.js";
import { prisma } from "../configs/db.config.js";

export const suggestTopics = async ({ userId, partnerUserId, context }) => {
  const me = await prisma.user.findUnique({ where: { id: userId } });
  const partner = partnerUserId
    ? await prisma.user.findUnique({ where: { id: partnerUserId } })
    : null;

  const sys = `너는 한국어로 대화 주제를 제안하는 도우미야.
- 5개의 짧은 주제를 JSON 배열로만 출력해.
- 각 항목은 35자 이하.
- 논쟁/혐오/민감 주제 제외.
사용자 힌트: ${context || "없음"}
나의 키워드: ${JSON.stringify(me?.sajuKeywords || {})}
상대 키워드: ${JSON.stringify(partner?.sajuKeywords || {})}`;

  const res = await genaiClient(genaiModels.GEMINI_2_5_FLASH, sys);
  try {
    if (!res) return [];
    const text = res?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const arr = JSON.parse(text);
    return Array.isArray(arr) ? arr.slice(0, 5) : [];
  } catch {
    return [];
  }
};


