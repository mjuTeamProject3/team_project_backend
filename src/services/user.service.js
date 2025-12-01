import { responseFromUser } from "../dtos/user.dto.js";
import { getUserWithCounts, getUser, updateUser } from "../repositories/user.repository.js";
import { InvalidRequestError } from "../errors/auth.error.js";
import { prisma } from "../configs/db.config.js";
import { getOrCalculateSajuKeywords } from "./saju.service.js";

export const userProfile = async (userId) => {
  const user = await getUserWithCounts({ targetUserId: userId });
  if (!user) {
    throw new InvalidRequestError("유저를 찾을 수 없습니다.");
  }
  
  // 사주 키워드 가져오기 또는 계산
  const sajuKeywords = await getOrCalculateSajuKeywords(userId);
  if (sajuKeywords.length > 0) {
    user.sajuKeywords = sajuKeywords;
  }
  
  return responseFromUser({
    user,
  });
};

export const otherUserProfile = async ({ targetUserId, currentUserId = null }) => {
  const user = await getUserWithCounts({ targetUserId });
  if (!user) {
    throw new InvalidRequestError("유저를 찾을 수 없습니다.");
  }
  
  // 사주 키워드 가져오기 또는 계산
  const sajuKeywords = await getOrCalculateSajuKeywords(targetUserId);
  if (sajuKeywords.length > 0) {
    user.sajuKeywords = sajuKeywords;
  }
  
  // 좋아요 상태 확인
  let isLiked = false;
  if (currentUserId && currentUserId !== targetUserId) {
    const { hasUserLiked } = await import("../repositories/like.repository.js");
    isLiked = await hasUserLiked({ fromUserId: currentUserId, toUserId: targetUserId });
  }
  
  return responseFromUser({ user, isLiked });
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
  
  // 생년월일이 변경되었으면 사주 키워드 재계산
  if (birthdate !== undefined && birthdate !== null) {
    console.log('[user] Birthdate updated, recalculating sajuKeywords for user:', userId);
    const sajuKeywords = await getOrCalculateSajuKeywords(userId);
    if (sajuKeywords.length > 0) {
      updated.sajuKeywords = sajuKeywords;
    }
  } else {
    // 생년월일이 변경되지 않았어도 키워드가 없으면 계산
    const sajuKeywords = await getOrCalculateSajuKeywords(userId);
    if (sajuKeywords.length > 0) {
      updated.sajuKeywords = sajuKeywords;
    }
  }
  
  return responseFromUser({ user: updated });
};

/**
 * 사용자 검색 (닉네임으로)
 * @param {Object} data - { query, limit, offset, excludeUserId }
 * @returns {Object} 검색된 사용자 목록
 */
export const searchUsers = async ({ query, limit, offset, excludeUserId }) => {
  if (!query || query.trim().length === 0) {
    return { users: [] };
  }
  
  const { searchUsersByUsername } = await import("../repositories/user.repository.js");
  const users = await searchUsersByUsername({ 
    query: query.trim(), 
    limit: limit || 20, 
    offset: offset || 0,
    excludeUserId 
  });
  
  return { users };
};
