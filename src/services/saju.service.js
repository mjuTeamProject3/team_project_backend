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

/**
 * 개별 사용자의 사주 키워드를 계산 (기본 사용자와 비교)
 * @param {Object} user - 사용자 객체 (birthdate, gender 포함)
 * @returns {Promise<string[]>} 사주 키워드 배열
 */
export const getUserSajuKeywords = async (user) => {
  if (!user?.birthdate || !user?.gender) {
    console.warn('[saju] Missing birthdate or gender for user:', user?.id);
    return [];
  }

  const url = fortuneConfig.FORTUNE_API_URL?.replace(/\/$/, "");
  if (!url) {
    console.warn("[saju] FORTUNE_API_URL is not set");
    return [];
  }

  // 기본 사용자 (2000-01-01, male)와 비교하여 키워드 추출
  const defaultUser = {
    year: 2000,
    month: 1,
    day: 1,
    isLunar: false,
    gender: 'male',
  };

  const userBirthInfo = convertToBirthInfo(user);
  if (!userBirthInfo) {
    console.warn('[saju] Invalid birthdate format for user:', user?.id);
    return [];
  }

  try {
    const payload = {
      user1: {
        birthInfo: userBirthInfo,
      },
      user2: {
        birthInfo: defaultUser,
      },
    };

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
    
    // traits.user1에서 키워드 추출 (배열로 변환)
    const traits = data.traits?.user1 || [];
    if (Array.isArray(traits)) {
      return traits;
    }
    
    // 객체 형태인 경우 값만 추출
    if (typeof traits === 'object' && traits !== null) {
      return Object.values(traits).filter(v => typeof v === 'string' && v.length > 0);
    }
    
    return [];
  } catch (e) {
    console.error("[saju] getUserSajuKeywords error:", e.message);
    return [];
  }
};

/**
 * 사용자의 사주 키워드를 가져오거나 계산
 * DB에 있으면 반환, 없으면 계산해서 저장 후 반환
 * @param {number} userId - 사용자 ID
 * @returns {Promise<string[]>} 사주 키워드 배열
 */
export const getOrCalculateSajuKeywords = async (userId) => {
  try {
    // DB에서 사용자 정보 가져오기
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, birthdate: true, gender: true, sajuKeywords: true }
    });

    if (!user) {
      console.warn('[saju] User not found:', userId);
      return [];
    }

    // birthdate나 gender가 없으면 계산 불가
    if (!user.birthdate || !user.gender) {
      console.warn('[saju] Missing birthdate or gender for user:', userId);
      return [];
    }

    // DB에 키워드가 있으면 반환
    if (user.sajuKeywords && Array.isArray(user.sajuKeywords) && user.sajuKeywords.length > 0) {
      return user.sajuKeywords;
    }

    // 없으면 계산
    console.log('[saju] Calculating sajuKeywords for user:', userId);
    const keywords = await getUserSajuKeywords(user);
    
    if (keywords.length > 0) {
      // DB에 저장
      await saveSajuKeywords({ userId, sajuKeywords: keywords });
      console.log('[saju] Saved sajuKeywords for user:', userId, keywords);
    }

    return keywords;
  } catch (e) {
    console.error("[saju] getOrCalculateSajuKeywords error:", e.message);
    return [];
  }
};


