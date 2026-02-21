import { type BannerCarouselItem } from '@1d1s/design-system';

export interface MainBannerItem extends BannerCarouselItem {
  href: string;
}

export interface HomeRandomDiaryItem {
  id: number;
  imageUrl: string;
  percent: number;
  likes: number;
  title: string;
  user: string;
  userImage: string;
  challengeLabel: string;
  challengeUrl: string;
  date: string;
  emotion: 'happy' | 'soso' | 'sad';
}

export interface HomeRandomChallengeItem {
  id: number;
  challengeTitle: string;
  challengeType: string;
  currentUserCount: number;
  maxUserCount: number;
  startDate: string;
  endDate: string;
  isOngoing: boolean;
}

export const HOME_RANDOM_DIARY_ITEMS: HomeRandomDiaryItem[] = Array.from({
  length: 12,
}).map((_, index) => ({
  id: index + 1,
  imageUrl: '/images/default-card.png',
  percent: [60, 100, 30, 85, 42, 70, 90, 55, 76, 64, 33, 88][index],
  likes: [10, 24, 5, 18, 11, 9, 17, 8, 21, 6, 4, 14][index],
  title: [
    '고라니 밥주기 3일차 성공!',
    '오늘의 목표 전부 달성!',
    '아직 갈 길이 멀다',
    '매일 매일 조금씩 성장',
    '오늘도 인증 성공, 내일도 이어간다',
    '한 챕터 정리 완료, 조금씩 쌓이는 중',
    '아침 러닝 5km 인증 완료',
    '오늘도 물 2L 달성!',
    'UI 시안 2개 완성',
    '독서 메모 10줄 작성',
    '프로틴 식단 지키기 성공',
    '알고리즘 난이도 업 도전',
  ][index],
  user: ['고라니', '개발자킴', '디자이너리', '성실맨', '러닝조아', '북러버'][
    index % 6
  ],
  userImage: '/images/default-profile.png',
  challengeLabel: [
    '고라니 챌린지',
    '알고리즘 챌린지',
    'UI 디자인 챌린지',
    '독서 챌린지',
    '아침 운동 챌린지',
    '독서 루틴 챌린지',
  ][index % 6],
  challengeUrl: '/diary',
  date: '2025.03.05',
  emotion: (['happy', 'happy', 'soso', 'happy', 'happy', 'soso'] as const)[
    index % 6
  ],
}));

export const HOME_MAIN_BANNERS: MainBannerItem[] = [
  {
    id: 'popular-challenge',
    type: '이번 주 추천',
    title: '지금 인기 챌린지 보러가기',
    subtitle: '가장 많이 참여 중인 챌린지를 확인해보세요.',
    href: '/challenge',
  },
  {
    id: 'community-diary',
    type: '커뮤니티 인기',
    title: '오늘의 커뮤니티 일지 보기',
    subtitle: '다른 챌린저들의 기록에서 동기를 받아보세요.',
    href: '/diary',
  },
  {
    id: 'challenge-create',
    type: '빠른 시작',
    title: '새 챌린지 만들기',
    subtitle: '지금 바로 목표를 정하고 챌린지를 시작해보세요.',
    href: '/challenge/create',
  },
];

export const HOME_RANDOM_CHALLENGE_ITEMS: HomeRandomChallengeItem[] = [
  {
    id: 1,
    challengeTitle: '챌린지 제목',
    challengeType: '고정목표형',
    currentUserCount: 12,
    maxUserCount: 20,
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    isOngoing: true,
  },
  {
    id: 2,
    challengeTitle: '챌린지 제목',
    challengeType: '고정목표형',
    currentUserCount: 12,
    maxUserCount: 20,
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    isOngoing: false,
  },
  {
    id: 3,
    challengeTitle: '챌린지 제목',
    challengeType: '고정목표형',
    currentUserCount: 12,
    maxUserCount: 20,
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    isOngoing: false,
  },
  {
    id: 4,
    challengeTitle: '챌린지 제목',
    challengeType: '고정목표형',
    currentUserCount: 12,
    maxUserCount: 20,
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    isOngoing: false,
  },
];
