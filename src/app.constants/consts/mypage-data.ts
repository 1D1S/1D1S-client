export type MyPageChallengeTone = 'orange' | 'blue' | 'gray';

export interface MyPageChallengeProgressItem {
  title: string;
  dday: string;
  progress: number;
  countText: string;
  tone: MyPageChallengeTone;
}

export type MyPageStatIconType =
  | 'flame'
  | 'trophy'
  | 'flag'
  | 'check-circle'
  | 'file-text'
  | 'target';

export interface MyPageStatItem {
  icon: MyPageStatIconType;
  title: string;
  value: string;
  unit: string;
  iconTone?: string;
}

export interface MyPageFriendRequestItem {
  name: string;
  message: string;
  imageUrl: string;
}

export interface MyPageFriendItem {
  name: string;
  status: string;
  imageSeed: string;
}

export interface MyPageProfileData {
  nickname: string;
  friendCount: number;
  imageUrl: string;
}

export function buildMyPageStreakData(): Array<{ date: string; count: number }> {
  return Array.from({ length: 364 }).map((_, index) => {
    const activityLevel = (index * 11 + 7) % 8;
    const count = activityLevel <= 1 ? 0 : activityLevel <= 3 ? 1 : activityLevel <= 5 ? 3 : 6;

    const baseDate = new Date(2025, 0, 1);
    baseDate.setDate(baseDate.getDate() + index);
    const date = baseDate.toISOString().slice(0, 10);

    return { date, count };
  });
}

export const MY_PAGE_CHALLENGE_PROGRESS_ITEMS: MyPageChallengeProgressItem[] = [
  {
    title: '고라니 밥주기',
    dday: 'D-15',
    progress: 60,
    countText: '12/20명 참여',
    tone: 'orange',
  },
  {
    title: '매일 일기 쓰기',
    dday: 'D-25',
    progress: 80,
    countText: '8/10명 참여',
    tone: 'blue',
  },
  {
    title: '아침 운동 인증',
    dday: '종료됨',
    progress: 100,
    countText: '24/30명 참여',
    tone: 'gray',
  },
];

export const MY_PAGE_STAT_ITEMS: MyPageStatItem[] = [
  { icon: 'flame', title: '현재 일지 스트릭', value: '12', unit: '일' },
  { icon: 'trophy', title: '일지 최장 스트릭', value: '42', unit: '일' },
  { icon: 'trophy', title: '목표 최장 스트릭', value: '30', unit: '일' },
  {
    icon: 'flag',
    title: '참여한 모든 챌린지',
    value: '15',
    unit: '개',
    iconTone: 'text-blue-600',
  },
  {
    icon: 'check-circle',
    title: '완료한 단기 챌린지',
    value: '8',
    unit: '개',
    iconTone: 'text-emerald-600',
  },
  {
    icon: 'file-text',
    title: '작성한 전체 일지',
    value: '156',
    unit: '개',
    iconTone: 'text-purple-600',
  },
  {
    icon: 'target',
    title: '완료한 전체 목표',
    value: '320',
    unit: '개',
    iconTone: 'text-pink-600',
  },
];

export const MY_PAGE_FRIEND_REQUEST_ITEMS: MyPageFriendRequestItem[] = [
  {
    name: 'DesignKing',
    message: '함께 챌린지 해요!',
    imageUrl: 'https://picsum.photos/seed/friend-request/80/80',
  },
];

export const MY_PAGE_FRIEND_ITEMS: MyPageFriendItem[] = [
  { name: 'HealthLover', status: '🔥 연속 11일 활동', imageSeed: 'friend-health' },
  { name: 'DevMaster', status: '10분 전 활동', imageSeed: 'friend-dev' },
];

export const MY_PAGE_PROFILE_DATA: MyPageProfileData = {
  nickname: '닉네임',
  friendCount: 24,
  imageUrl: 'https://picsum.photos/seed/mypage-user/200/200',
};
