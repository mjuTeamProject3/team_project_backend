import { prisma } from "../configs/db.config.js";
export const addUser = async (data) => {
  const user = await prisma.user.findFirst({ where: { email: data.email } });
  if (user) {
    return null;
  }
  const created = await prisma.user.create({ data: data });
  return created.id;
};
export const getUser = async (userId) => {
  const user = await prisma.user.findFirstOrThrow({ where: { id: userId } });
  return user;
};

export const getUserWithCounts = async ({ targetUserId }) => {
  const user = await prisma.user.findFirst({ where: { id: targetUserId } });
  if (!user) return null;
  const [likesCount, friendsCount] = await Promise.all([
    prisma.like.count({ where: { toUserId: targetUserId } }),
    prisma.friendship.count({ where: { status: "ACCEPTED", OR: [{ userOneId: targetUserId }, { userTwoId: targetUserId }] } }),
  ]);
  return { ...user, likesCount, friendsCount };
};

export const updateUser = async ({ userId, data }) => {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: data,
  });
  return updated;
};

// 소셜 로그인 사용자 찾기 또는 생성
export const findOrCreateSocialUser = async (data) => {
  // provider와 socialId로 먼저 찾기
  let user = await prisma.user.findFirst({
    where: {
      provider: data.provider,
      socialId: data.socialId,
    },
  });

  if (user) {
    // 기존 사용자인 경우, 추가 정보가 있으면 업데이트
    if (data.username || data.birthdate || data.location || data.gender) {
      const updateData = {};
      if (data.username) updateData.username = data.username;
      if (data.birthdate) updateData.birthdate = new Date(data.birthdate);
      if (data.location) updateData.location = data.location;
      if (data.gender) updateData.gender = data.gender;
      
      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }
    return user;
  }

  // 이메일로 찾기 (같은 이메일로 일반 가입한 경우)
  user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (user) {
    // 기존 사용자에 소셜 정보 및 추가 정보 업데이트
    const updateData = {
      provider: data.provider,
      socialId: data.socialId,
      avatar: data.avatar || user.avatar,
    };
    if (data.username) updateData.username = data.username;
    if (data.birthdate) updateData.birthdate = new Date(data.birthdate);
    if (data.location) updateData.location = data.location;
    if (data.gender) updateData.gender = data.gender;
    
    user = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
    return user;
  }

  // 새 사용자 생성
  // username은 전달받은 값 사용, 없으면 이메일 기반으로 생성
  let username = data.username;
  if (!username) {
    const baseUsername = data.email.split("@")[0];
    username = baseUsername;
    let counter = 1;
    // 중복 체크
    while (await prisma.user.findFirst({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
  } else {
    // 전달받은 username 중복 체크
    const existingUser = await prisma.user.findFirst({ where: { username } });
    if (existingUser) {
      // 중복이면 숫자 추가
      let counter = 1;
      const baseUsername = username;
      while (await prisma.user.findFirst({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
    }
  }

  const created = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      username: username,
      provider: data.provider,
      socialId: data.socialId,
      avatar: data.avatar || null,
      password: null, // 소셜 로그인은 비밀번호 없음
      // 추가 정보 포함
      birthdate: data.birthdate ? new Date(data.birthdate) : null,
      location: data.location || null,
      gender: data.gender || null,
    },
  });

  return created;
};