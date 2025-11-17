import { responseFromUser } from "../dtos/user.dto.js";
import { addUser, getUser, findOrCreateSocialUser } from "../repositories/user.repository.js";
import {
  getUserSignIn,
  updateUserRefresh,
  getUserRefresh,
} from "../repositories/auth.repository.js";
import {
  DuplicateEmailError,
  InvalidRequestError,
  NotRefreshTokenError,
} from "../errors/auth.error.js";
import { responseFromAuth } from "../dtos/auth.dto.js";
import { createJwt } from "../utils/jwt.util.js";
import { createHashedPassword } from "../utils/crypto.util.js";

export const signUp = async (data) => {
  const hashedPassword = createHashedPassword(data.password);
  const userId = await addUser({
    email: data.email,
    name: data.name,
    username: data.username,
    avatar: data.avatar || null,
    password: hashedPassword,
  });

  if (userId === null) {
    throw new DuplicateEmailError("이미 존재하는 이메일입니다.", data);
  }

  const user = await getUser(userId);
  return responseFromUser({
    user,
  });
};

export const signIn = async (data) => {
  const user = await getUserSignIn({
    email: data.email,
  });
  
  // 소셜 로그인 사용자는 일반 로그인 불가
  if (user === null || user.password === null) {
    throw new InvalidRequestError("이메일 또는 비밀번호가 일치하지 않습니다.");
  }
  
  const hashedPassword = createHashedPassword(data.password);
  if (user.password !== hashedPassword) {
    throw new InvalidRequestError("이메일 또는 비밀번호가 일치하지 않습니다.");
  }
  
  const accessToken = createJwt({ userId: user.id, type: "AT" });
  const refreshToken = createJwt({ userId: user.id, type: "RT" });

  const updateUser = await updateUserRefresh(user.id, refreshToken);
  if (!updateUser) {
    throw new InvalidRequestError("로그인에 실패했습니다.");
  }
  const auth = {
    id: user.id,
    accessToken: accessToken,
    refreshToken: refreshToken,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return responseFromAuth({
    auth,
  });
};

export const signOut = async (userId) => {
  const user = await updateUserRefresh(userId, null);
  if (user === null) {
    throw new InvalidRequestError("로그아웃에 실패했습니다.");
  }
  return {};
};

export const refresh = async (data) => {
  const user = await getUserRefresh({
    refreshToken: data.refreshToken,
  });
  if (user === null) {
    throw new NotRefreshTokenError("유효하지 않은 리프레시 토큰입니다.");
  }
  const accessToken = createJwt({ userId: user.id, type: "AT" });
  const refreshToken = createJwt({ userId: user.id, type: "RT" });
  await updateUserRefresh(user.id, refreshToken);
  const auth = {
    id: user.id,
    name: user.name,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
  return responseFromAuth({
    auth,
  });
};

// 소셜 로그인 (사용자만 찾기/생성, 토큰 발급 안 함)
export const socialLogin = async (socialUser) => {
  const user = await findOrCreateSocialUser({
    provider: socialUser.provider,
    socialId: socialUser.socialId,
    email: socialUser.email,
    name: socialUser.name,
    avatar: socialUser.avatar,
  });

  // 토큰 발급하지 않고 사용자 정보만 반환
  return user;
};

// 프로필 완성 후 토큰 발급
export const issueTokens = async (userId) => {
  const accessToken = createJwt({ userId, type: "AT" });
  const refreshToken = createJwt({ userId, type: "RT" });

  const updateUser = await updateUserRefresh(userId, refreshToken);
  if (!updateUser) {
    throw new InvalidRequestError("토큰 발급에 실패했습니다.");
  }

  const auth = {
    id: userId,
    accessToken: accessToken,
    refreshToken: refreshToken,
    createdAt: updateUser.createdAt,
    updatedAt: updateUser.updatedAt,
  };

  return responseFromAuth({
    auth,
  });
};