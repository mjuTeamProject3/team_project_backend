/**
 * 요청 본문에서 생년월일시 정보 추출
 * @param {Object} body - 요청 본문
 * @returns {Object} 생년월일시 정보
 */
const normalizeGender = (gender) => {
  if (!gender) return "female";
  const value = String(gender).trim().toLowerCase();
  if (["male", "m", "man", "남", "남성"].includes(value)) return "male";
  return "female";
};

export const bodyToBirthInfo = (body) => {
  return {
    year: body.year,
    month: body.month,
    day: body.day,
    isLunar: body.isLunar || false,
    gender: normalizeGender(body.gender),
  };
};

/**
 * 요청 본문에서 두 사용자의 생년월일시 정보 추출
 * @param {Object} body - 요청 본문
 * @returns {Object} 두 사용자의 생년월일시 정보
 */
export const bodyToCompatibility = (body) => {
  return {
    user1: bodyToBirthInfo(body.user1),
    user2: bodyToBirthInfo(body.user2),
  };
};

/**
 * 사주 정보 응답 변환
 * @param {Object} fortune - 사주 정보
 * @returns {Object} 변환된 사주 정보
 */
export const responseFromFortune = ({ fortune }) => {
  return {
    heavenlyStems: fortune.heavenlyStems,
    earthlyBranches: fortune.earthlyBranches,
    fiveElements: fortune.fiveElements,
    zodiacSign: fortune.zodiacSign,
    animalSign: fortune.animalSign,
  };
};

/**
 * 궁합 분석 결과 응답 변환
 * @param {Object} compatibility - 궁합 분석 결과
 * @returns {Object} 변환된 궁합 분석 결과
 */
export const responseFromCompatibility = ({ compatibility }) => {
  return {
    score: compatibility.score,
    finalScore: compatibility.finalScore,
    originalScore: compatibility.originalScore,
    stressScore: compatibility.stressScore,
    level: compatibility.level,
    analysis: compatibility.analysis,
    details: compatibility.details,
    traits: compatibility.traits,
  };
};

