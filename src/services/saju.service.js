import { prisma } from "../configs/db.config.js";
import fortuneConfig from "../configs/fortune.config.js";

const normalizeGender = (gender) => {
  if (!gender) return "female";
  const value = String(gender).trim().toLowerCase();
  if (["male", "m", "man", "남", "남성"].includes(value)) return "male";
  return "female";
};

/**
 * 유저 객체를 FortuneAPI가 요구하는 birthInfo 형식으로 변환
 * @param {Object|null} user - Prisma User 객체
 * @returns {Object|null} birthInfo 객체 또는 null
 */
const convertToBirthInfo = (user) => {
  if (!user?.birthdate) return null;

  const date = new Date(user.birthdate);
  if (isNaN(date.getTime())) return null;

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // 0-based to 1-based
    day: date.getDate(),
    isLunar: false, // 기본값: 양력 (User 모델에 isLunar 필드가 없음)
    gender: normalizeGender(user.gender),
  };
};

// Fetch compatibility score from external Python microservice (FortuneAPI)
export const getCompatibilityScore = async ({ userIdA, userIdB }) => {
  const a = await prisma.user.findUnique({ where: { id: userIdA } });
  const b = await prisma.user.findUnique({ where: { id: userIdB } });
  if (!a || !b) return { 
    score: null, 
    finalScore: null,
    originalScore: null,
    stressScore: null,
    verdict: null 
  };

  // birthdate가 없으면 궁합 분석 불가
  if (!a.birthdate || !b.birthdate) {
    console.warn(`[saju] Missing birthdate: userA=${userIdA}, userB=${userIdB}`);
    return { 
      score: null, 
      finalScore: null,
      originalScore: null,
      stressScore: null,
      verdict: null 
    };
  }

  const birthInfoA = convertToBirthInfo(a);
  const birthInfoB = convertToBirthInfo(b);
  
  if (!birthInfoA || !birthInfoB) {
    console.warn(`[saju] Invalid birthdate format: userA=${userIdA}, userB=${userIdB}`);
    return { 
      score: null, 
      finalScore: null,
      originalScore: null,
      stressScore: null,
      verdict: null 
    };
  }

  const url = fortuneConfig.FORTUNE_API_URL?.replace(/\/$/, "");
  if (!url) {
    console.warn("[saju] FORTUNE_API_URL is not set");
    return { 
      score: null, 
      finalScore: null,
      originalScore: null,
      stressScore: null,
      verdict: null 
    };
  }

  try {
    // FortuneAPI가 요구하는 payload 형식
    const payload = {
      user1: {
        birthInfo: birthInfoA,
      },
      user2: {
        birthInfo: birthInfoB,
      },
    };

    // 디버깅: 요청 payload 로깅
    console.log(`[saju] Request to FortuneAPI:`, JSON.stringify(payload, null, 2));

    const res = await fetch(`${url}/fortune/compatibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`FortuneAPI error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    
    // 디버깅: 응답 로깅
    console.log(`[saju] Response from FortuneAPI:`, JSON.stringify(data, null, 2));
    
    // FortuneAPI 응답 형식: { score, finalScore, originalScore, stressScore, level, analysis, details }
    // FortuneAPI에서 계산한 모든 점수를 그대로 사용 (변환/수정 없음)
    const finalScore = data.finalScore ?? data.score ?? null;
    const originalScore = data.originalScore ?? null;
    const stressScore = data.stressScore ?? null;
    const score = finalScore ?? data.score ?? null; // 호환성을 위해 finalScore 우선 사용
    
    // 점수가 유효한 숫자인지 확인 (FortuneAPI 코드에서 계산한 점수 그대로 사용)
    const validateScore = (val) => {
      if (val === null || val === undefined) return null;
      if (typeof val !== 'number' || isNaN(val)) {
        console.warn(`[saju] Invalid score type from FortuneAPI: ${val}`);
        return null;
      }
      return val;
    };
    
    const validatedFinalScore = validateScore(finalScore);
    const validatedOriginalScore = validateScore(originalScore);
    const validatedStressScore = validateScore(stressScore);
    const validatedScore = validatedFinalScore ?? validateScore(data.score);
    
    // FortuneAPI 코드에서 계산한 점수를 그대로 사용 (0-100 범위 제한도 FortuneAPI에서 처리)
    
    const verdict = data.analysis?.overall || 
                   (data.level ? `궁합도: ${data.level}` : null) ||
                   null;

    // 전체 분석 결과도 함께 반환 (대화 주제 추천에 사용)
    return { 
      score: validatedScore, // 호환성을 위해 유지 (finalScore 우선)
      finalScore: validatedFinalScore,
      originalScore: validatedOriginalScore,
      stressScore: validatedStressScore,
      verdict,
      fullAnalysis: data // 전체 분석 결과 저장
    };
  } catch (e) {
    console.error("[saju] API error:", e.message);
    return { 
      score: null, 
      finalScore: null,
      originalScore: null,
      stressScore: null,
      verdict: null 
    };
  }
};

// Placeholder: later call external Python API, then persist result
export const saveSajuKeywords = async ({ userId, sajuKeywords }) => {
  await prisma.user.update({ where: { id: userId }, data: { sajuKeywords } });
  return {};
};


