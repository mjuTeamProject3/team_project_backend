import { calculateFortune, checkCompatibility } from "../utils/fortune.util.js";
import {
  responseFromFortune,
  responseFromCompatibility,
} from "../dtos/fortune.dto.js";
import { InvalidRequestError } from "../errors/auth.error.js";
import axios from "axios";
import fortuneConfig from "../configs/fortune.config.js";

/**
 * 사주 계산 서비스
 * @param {Object} birthInfo - 생년월일 및 성별 정보
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
 * @param {Object} user1 - 첫 번째 사용자 생년월일 및 성별 정보
 * @param {Object} user2 - 두 번째 사용자 생년월일 및 성별 정보
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

/**
 * 사주 기반 대화 주제 추천 서비스
 * @param {Object} analysisResult - 궁합 분석 결과
 * @returns {Promise<Array>} 대화 주제 배열
 */
export async function getSajuTopics(analysisResult) {
  try {
    const FORTUNE_API_URL = fortuneConfig.FORTUNE_API_URL || "http://localhost:8000";
    const res = await axios.post(`${FORTUNE_API_URL}/saju/recommend`, analysisResult, {
      timeout: 30000, // 30초 타임아웃 (Gemini API 호출 시간 고려)
    });
    return res.data.topics || [];
  } catch (error) {
    console.error("Error getting saju topics:", error);
    if (error.response) {
      throw new InvalidRequestError(
        `대화 주제 추천에 실패했습니다: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    } else if (error.request) {
      throw new InvalidRequestError("FortuneAPI 서버에 연결할 수 없습니다.");
    } else {
      throw new InvalidRequestError(
        `대화 주제 추천에 실패했습니다: ${error.message}`
      );
    }
  }
}