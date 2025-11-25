export const responseFromUser = ({ user }) => {
  return {
    userId: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar || null,
    location: user.location || null,
    gender: user.gender || null,
    birthdate: user.birthdate || null,
    sajuKeywords: user.sajuKeywords || null,
    likesCount: user.likesCount ?? undefined,
    friendsCount: user.friendsCount ?? undefined,
    refreshToken: user.refreshToken,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * 다른 사람 프로필 조회용 DTO (공개 정보만)
 * @param {Object} user - 사용자 객체
 * @returns {Object} 공개 프로필 정보
 */
export const responseFromOtherUser = ({ user }) => {
  return {
    userId: user.id,
    username: user.username,        // 닉네임
    avatar: user.avatar || null,     // 프로필 사진
    location: user.location || null, // 지역
    likesCount: user.likesCount ?? 0, // 좋아요 수
    friendsCount: user.friendsCount ?? 0, // 친구 수
    sajuKeywords: user.sajuKeywords || null, // 사주 키워드 (배열 또는 null)
  };
};

export const bodyToProfileUpdate = (body) => {
  return {
    username: body.username || null,
    birthdate: body.birthdate || null,
    location: body.location || null,
    gender: body.gender || null,
  };
};