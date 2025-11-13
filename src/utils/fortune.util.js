import axios from "axios";
import fortuneConfig from "../configs/fortune.config.js";

const fortuneApiClient = axios.create({
  baseURL: fortuneConfig.FORTUNE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 사주 계산 API 호출
 * @param {Object} birthInfo - 생년월일시 정보
 * @param {number} birthInfo.year - 연도
 * @param {number} birthInfo.month - 월
 * @param {number} birthInfo.day - 일
 * @param {number} birthInfo.hour - 시
 * @param {number} birthInfo.minute - 분
 * @param {boolean} birthInfo.isLunar - 음력 여부
 * @returns {Promise<Object>} 사주 정보
 */
export const calculateFortune = async (birthInfo) => {
  try {
    const response = await fortuneApiClient.post("/fortune/calculate", {
      birthInfo: birthInfo,
    });
    return response.data;
  } catch (error) {
    console.error("Error calculating fortune:", error);
    if (error.response) {
      throw new Error(
        `FortuneAPI Error: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    } else if (error.request) {
      throw new Error("FortuneAPI 서버에 연결할 수 없습니다.");
    } else {
      throw error;
    }
  }
};

/**
 * 궁합 분석 API 호출
 * @param {Object} user1 - 첫 번째 사용자 생년월일시 정보
 * @param {Object} user2 - 두 번째 사용자 생년월일시 정보
 * @returns {Promise<Object>} 궁합 분석 결과
 */
export const checkCompatibility = async (user1, user2) => {
  try {
    const response = await fortuneApiClient.post("/fortune/compatibility", {
      user1: {
        birthInfo: user1,
      },
      user2: {
        birthInfo: user2,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking compatibility:", error);
    if (error.response) {
      throw new Error(
        `FortuneAPI Error: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    } else if (error.request) {
      throw new Error("FortuneAPI 서버에 연결할 수 없습니다.");
    } else {
      throw error;
    }
  }
};

/**
 * FortuneAPI 서버 상태 확인
 * @returns {Promise<Object>} 서버 상태 정보
 */
export const checkFortuneApiHealth = async () => {
  try {
    const response = await fortuneApiClient.get("/health");
    return response.data;
  } catch (error) {
    console.error("Error checking FortuneAPI health:", error);
    throw error;
  }
};

