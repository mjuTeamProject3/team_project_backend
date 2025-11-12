import { calculateFortune, checkCompatibility } from "../utils/fortune.util.js";
import {
  responseFromFortune,
  responseFromCompatibility,
} from "../dtos/fortune.dto.js";
import { InvalidRequestError } from "../errors/auth.error.js";

/**
 * 사주 계산 서비스
 * @param {Object} birthInfo - 생년월일시 정보
 * @returns {Object} 사주 정보
 */
export const calculateUserFortune = async (birthInfo) => {
  try {
    const fortune = await calculateFortune(birthInfo);
    return responseFromFortune({ fortune });
  } catch (error) {
    throw new InvalidRequestError(
      `사주 계산에 실패했습니다: ${error.message}`
    );
  }
};

/**
 * 궁합 분석 서비스
 * @param {Object} user1 - 첫 번째 사용자 생년월일시 정보
 * @param {Object} user2 - 두 번째 사용자 생년월일시 정보
 * @returns {Object} 궁합 분석 결과
 */
export const checkUserCompatibility = async (user1, user2) => {
  try {
    const compatibility = await checkCompatibility(user1, user2);
    return responseFromCompatibility({ compatibility });
  } catch (error) {
    throw new InvalidRequestError(
      `궁합 분석에 실패했습니다: ${error.message}`
    );
  }
};

