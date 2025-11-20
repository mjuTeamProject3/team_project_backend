import { prisma } from '../src/configs/db.config.js';

// 테스트 사용자 데이터 (avatar는 짧은 URL 또는 null 사용)
const testUsers = [
  { email: 'user1@test.com', name: '카리나', username: 'karina', location: '서울', gender: '여성', avatar: null },
  { email: 'user2@test.com', name: '유나', username: 'yuna', location: '서울', gender: '여성', avatar: null },
  { email: 'user3@test.com', name: '윈터', username: 'winter', location: '경기', gender: '여성', avatar: null },
  { email: 'user4@test.com', name: '설윤', username: 'sulyun', location: '인천', gender: '여성', avatar: null },
  { email: 'user5@test.com', name: '카즈하', username: 'kazuha', location: '서울', gender: '여성', avatar: null },
  { email: 'user6@test.com', name: '김채원', username: 'chaewon', location: '부산', gender: '여성', avatar: null },
  { email: 'user7@test.com', name: '이안', username: 'an', location: '대구', gender: '여성', avatar: null },
  { email: 'user8@test.com', name: '쥴리', username: 'julie', location: '서울', gender: '여성', avatar: null },
  { email: 'user9@test.com', name: '김유연', username: 'yuyun', location: '광주', gender: '여성', avatar: null },
  { email: 'user10@test.com', name: '나띠', username: 'nati', location: '서울', gender: '여성', avatar: null },
  { email: 'user11@test.com', name: '조아용', username: 'joayong', location: '서울', gender: '남성', avatar: null },
  { email: 'user12@test.com', name: '한강뷰', username: 'hankang', location: '서울', gender: '남성', avatar: null },
  { email: 'user13@test.com', name: '비즈니스맨', username: 'businessman', location: '서울', gender: '남성', avatar: null },
  { email: 'user14@test.com', name: '서울숲', username: 'seoulseoul', location: '서울', gender: '남성', avatar: null },
  { email: 'user15@test.com', name: '신촌을 못가', username: 'sinchon', location: '서울', gender: '남성', avatar: null },
];

// 좋아요 데이터 생성 (효율적으로)
const generateLikes = (users) => {
  const likes = [];
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const likeSet = new Set(); // 중복 방지용
  
  // 각 사용자별 좋아요 개수 (더미 데이터와 비슷하게)
  const likeCounts = [
    { userId: 0, total: 15420, monthly: 8650 }, // 카리나
    { userId: 1, total: 12890, monthly: 7980 }, // 유나
    { userId: 2, total: 11250, monthly: 7320 }, // 윈터
    { userId: 3, total: 9870, monthly: 6850 },  // 설윤
    { userId: 4, total: 9200, monthly: 6200 },  // 카즈하
    { userId: 5, total: 8650, monthly: 8650 },   // 김채원
    { userId: 6, total: 7980, monthly: 7980 },  // 이안
    { userId: 7, total: 7320, monthly: 7320 },  // 쥴리
    { userId: 8, total: 6850, monthly: 6850 },  // 김유연
    { userId: 9, total: 6200, monthly: 6200 },  // 나띠
    { userId: 10, total: 3420, monthly: 1200 }, // 조아용
    { userId: 11, total: 2890, monthly: 1000 }, // 한강뷰
    { userId: 12, total: 2650, monthly: 900 },   // 비즈니스맨
    { userId: 13, total: 2420, monthly: 800 },  // 서울숲
    { userId: 14, total: 2300, monthly: 750 },  // 신촌을 못가
  ];
  
  for (const { userId, total, monthly } of likeCounts) {
    if (userId >= users.length) continue;
    
    const targetUser = users[userId];
    const otherUsers = users.filter(u => u.id !== targetUser.id);
    
    // 이번 달 좋아요 생성
    for (let i = 0; i < monthly && i < otherUsers.length * 2; i++) {
      const fromUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      const key = `${fromUser.id}-${targetUser.id}`;
      
      if (!likeSet.has(key)) {
        likeSet.add(key);
        likes.push({
          fromUserId: fromUser.id,
          toUserId: targetUser.id,
          createdAt: new Date(thisMonth.getTime() + Math.random() * (now.getTime() - thisMonth.getTime())),
        });
      }
    }
    
    // 전체 좋아요 생성 (과거 포함)
    for (let i = 0; i < total && likes.filter(l => l.toUserId === targetUser.id).length < total; i++) {
      const fromUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      const key = `${fromUser.id}-${targetUser.id}`;
      
      if (!likeSet.has(key)) {
        likeSet.add(key);
        // 이번 달 좋아요는 이미 생성했으므로 과거 날짜로
        const daysAgo = Math.random() * 90; // 최근 90일 내
        const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        
        likes.push({
          fromUserId: fromUser.id,
          toUserId: targetUser.id,
          createdAt,
        });
      }
    }
  }
  
  return likes;
};

async function main() {
  console.log('🌱 테스트 데이터 생성 시작...');
  
  try {
    // 기존 데이터 삭제 (선택사항)
    console.log('🗑️  기존 좋아요 데이터 삭제 중...');
    await prisma.like.deleteMany({});
    
    console.log('🗑️  기존 사용자 데이터 삭제 중...');
    await prisma.user.deleteMany({});
    
    // 사용자 생성
    console.log('👤 테스트 사용자 생성 중...');
    const createdUsers = [];
    for (const userData of testUsers) {
      try {
        const user = await prisma.user.create({
          data: {
            ...userData,
            provider: 'google',
            socialId: `test_${userData.username}`,
            birthdate: new Date('2000-01-01'),
          },
        });
        createdUsers.push(user);
        console.log(`✅ ${user.username} 생성 완료 (ID: ${user.id})`);
      } catch (error) {
        if (error.code === 'P2002') {
          // 중복된 이메일이나 username인 경우
          console.log(`⚠️  ${userData.username} 이미 존재함, 건너뜀`);
        } else {
          throw error;
        }
      }
    }
    
    if (createdUsers.length === 0) {
      console.log('⚠️  생성된 사용자가 없습니다. 기존 사용자를 사용합니다.');
      const existingUsers = await prisma.user.findMany({
        orderBy: { id: 'asc' },
        take: testUsers.length,
      });
      createdUsers.push(...existingUsers);
    }
    
    // 좋아요 데이터 생성
    console.log('❤️  좋아요 데이터 생성 중...');
    const likes = generateLikes(createdUsers);
    
    console.log(`📊 생성된 좋아요 데이터: ${likes.length}개`);
    
    // 배치로 삽입 (성능 향상)
    const batchSize = 500;
    for (let i = 0; i < likes.length; i += batchSize) {
      const batch = likes.slice(i, i + batchSize);
      await prisma.like.createMany({
        data: batch,
        skipDuplicates: true,
      });
      console.log(`✅ 좋아요 ${Math.min(i + batchSize, likes.length)}/${likes.length} 삽입 완료`);
    }
    
    console.log('✅ 테스트 데이터 생성 완료!');
    console.log(`📊 생성된 사용자: ${createdUsers.length}명`);
    console.log(`❤️  생성된 좋아요: ${likes.length}개`);
    
    // 랭킹 확인
    const overallRanking = await prisma.like.groupBy({
      by: ['toUserId'],
      _count: { toUserId: true },
      orderBy: { _count: { toUserId: 'desc' } },
      take: 5,
    });
    console.log('\n📊 전체 랭킹 Top 5:');
    for (const item of overallRanking) {
      const user = createdUsers.find(u => u.id === item.toUserId);
      console.log(`  ${user?.username}: ${item._count.toUserId}개 좋아요`);
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

