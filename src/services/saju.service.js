import { prisma } from "../configs/db.config.js";
import fortuneConfig from "../configs/fortune.config.js";

/**
 * birthdate를 FortuneAPI가 요구하는 birthInfo 형식으로 변환
 * @param {Date|string|null} birthdate - 사용자의 생년월일
 * @returns {Object|null} birthInfo 객체 또는 null
 */
const convertToBirthInfo = (birthdate) => {
  if (!birthdate) return null;
  
  const date = new Date(birthdate);
  if (isNaN(date.getTime())) return null;
  
  // 시간 정보 추출 (시간 정보가 없으면 12시로 기본값 설정)
  // 생년월일만 있는 경우 (예: "1998-02-01") 시간 정보가 없으므로 기본값 12시 사용
  // 원본 birthdate가 문자열인 경우 시간 부분이 있는지 확인
  let hour = 12; // 기본값: 정오
  let minute = 0;
  
  if (typeof birthdate === 'string') {
    // 문자열 형식에서 시간 정보가 있는지 확인 (예: "1998-02-01T14:30:00" 또는 "1998-02-01 14:30")
    const hasTimeInString = /T\d{2}:\d{2}/.test(birthdate) || /\s+\d{2}:\d{2}/.test(birthdate);
    if (hasTimeInString) {
      hour = date.getHours();
      minute = date.getMinutes();
    }
  } else {
    // Date 객체인 경우, 로컬 시간이 0시 0분이 아니면 사용 (시간 정보가 있다고 가정)
    const localHour = date.getHours();
    const localMinute = date.getMinutes();
    if (localHour !== 0 || localMinute !== 0) {
      hour = localHour;
      minute = localMinute;
    }
  }
  
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // 0-based to 1-based
    day: date.getDate(),
    hour: hour,
    minute: minute,
    isLunar: false, // 기본값: 양력 (User 모델에 isLunar 필드가 없음)
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

  const birthInfoA = convertToBirthInfo(a.birthdate);
  const birthInfoB = convertToBirthInfo(b.birthdate);
  
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


