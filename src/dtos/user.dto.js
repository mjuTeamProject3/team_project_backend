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

export const bodyToProfileUpdate = (body) => {
  return {
    username: body.username || null,
    birthdate: body.birthdate || null,
    location: body.location || null,
    gender: body.gender || null,
  };
};