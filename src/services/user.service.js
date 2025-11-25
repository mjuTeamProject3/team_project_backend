import { responseFromUser, responseFromOtherUser } from "../dtos/user.dto.js";
import { getUserWithCounts, getUser, updateUser } from "../repositories/user.repository.js";
import { InvalidRequestError } from "../errors/auth.error.js";
import { prisma } from "../configs/db.config.js";
import { getOrCalculateSajuKeywords } from "../services/saju.service.js";

export const userProfile = async (userId) => {
  const user = await getUserWithCounts({ targetUserId: userId });
  if (!user) {
    throw new InvalidRequestError("유저를 찾을 수 없습니다.");
  }
  
  // 사주 키워드 가져오기 (DB에 있으면 사용, 없으면 계산)
  const sajuKeywords = await getOrCalculateSajuKeywords({ userId });
  
  // 사주 키워드를 user 객체에 추가
  const userWithKeywords = {
    ...user,
    sajuKeywords: sajuKeywords || user.sajuKeywords || null
  };
  
  return responseFromUser({
    user: userWithKeywords,
  });
};

export const otherUserProfile = async ({ targetUserId }) => {
  const user = await getUserWithCounts({ targetUserId });
  if (!user) {
    throw new InvalidRequestError("유저를 찾을 수 없습니다.");
  }
  
  // 사주 키워드 가져오기 (DB에 있으면 사용, 없으면 계산)
  const sajuKeywords = await getOrCalculateSajuKeywords({ userId: targetUserId });
  
  // 사주 키워드를 user 객체에 추가
  const userWithKeywords = {
    ...user,
    sajuKeywords: sajuKeywords || user.sajuKeywords || null
  };
  
  // 다른 사람 프로필은 공개 정보만 반환
  return responseFromOtherUser({ user: userWithKeywords });
};

/**
 * 프로필 완성도 체크
 * @param {Object} user - 사용자 객체
 * @returns {Object} { isComplete: boolean, missingFields: string[] }
 */
export const checkProfileComplete = (user) => {
  // 필수 정보: birthdate, username, location
  const requiredFields = {
    birthdate: user.birthdate,
    username: user.username,
    location: user.location,
  };
  
  // 하나라도 없으면 미완성
  const isComplete = Object.values(requiredFields).every(
    (field) => field !== null && field !== undefined && field !== ''
  );
  
  const missingFields = Object.keys(requiredFields).filter(
    (key) => !requiredFields[key]
  );
  
  return {
    isComplete,
    missingFields,
  };
};

/**
 * 프로필 업데이트 (추가 정보 입력)
 * @param {Object} data - { userId, username, birthdate, location, gender }
 * @returns {Object} 업데이트된 사용자 정보
 */
export const updateProfile = async ({ userId, username, birthdate, location, gender }) => {
  // username 중복 체크
  if (username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username,
        NOT: { id: userId },
      },
    });
    
    if (existingUser) {
      throw new InvalidRequestError("이미 사용 중인 닉네임입니다.");
    }
  }
  
  // birthdate 형식 검증
  if (birthdate) {
    const date = new Date(birthdate);
    if (isNaN(date.getTime())) {
      throw new InvalidRequestError("올바른 생년월일 형식이 아닙니다.");
    }
  }
  
  // 업데이트할 데이터 준비
  const updateData = {};
  if (username !== undefined && username !== null) updateData.username = username;
  if (birthdate !== undefined && birthdate !== null) updateData.birthdate = new Date(birthdate);
  if (location !== undefined && location !== null) updateData.location = location;
  if (gender !== undefined && gender !== null) updateData.gender = gender;
  
  // 업데이트
  const updated = await updateUser({ userId, data: updateData });
  
  // 생년월일이 변경되었거나 새로 입력된 경우 사주 키워드 재계산
  if (birthdate !== undefined && birthdate !== null) {
    try {
      const sajuKeywords = await getOrCalculateSajuKeywords({ userId });
      if (sajuKeywords && sajuKeywords.length > 0) {
        console.log('✅ 프로필 업데이트 후 사주 키워드 계산 완료:', sajuKeywords);
      }
    } catch (err) {
      console.error('❌ 사주 키워드 계산 중 에러:', err.message);
      // 에러가 발생해도 프로필 업데이트는 계속 진행
    }
  }
  
  return responseFromUser({ user: updated });
};
