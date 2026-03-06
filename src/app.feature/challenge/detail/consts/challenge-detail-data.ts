export interface PendingMember {
  name: string;
  joinedAt: string;
}

export interface ChallengeParticipant {
  name: string;
  role: string;
  highlighted?: boolean;
}

export interface RecentLogItem {
  title: string;
  description: string;
  time: string;
  badge?: string;
}

export type ChallengeDiaryEmotion = 'happy' | 'soso' | 'sad';

export interface ChallengeDiaryDummyItem {
  diaryId: number;
  createdAt: string;
  title: string;
  imageUrl: string;
  user: string;
  userImage: string;
  challengeLabel: string;
  dateLabel: string;
  emotion: ChallengeDiaryEmotion;
  percent: number;
  isLiked: boolean;
  likes: number;
}

export const CHALLENGE_DETAIL_PENDING_MEMBERS: PendingMember[] = [
  { name: 'Newbie_Kim', joinedAt: '오늘 가입' },
  { name: 'Runner_Lee', joinedAt: '1일 전' },
  { name: 'Park_Coding', joinedAt: '2일 전' },
];

export const CHALLENGE_DETAIL_PARTICIPANTS: ChallengeParticipant[] = [
  { name: '고라니', role: '#호스트', highlighted: true },
  { name: 'U챌1', role: '참여자' },
  { name: 'U챌2', role: '참여자' },
  { name: 'U챌3', role: '참여자' },
  { name: 'U챌4', role: '참여자' },
  { name: 'U챌5', role: '참여자' },
  { name: 'U챌6', role: '참여자' },
];

export const CHALLENGE_DETAIL_RECENT_LOGS: RecentLogItem[] = [
  {
    title: '고라니 아침 미주기 완료',
    description: '오늘도 고라니가 밥을 잘 먹네요. 날씨가 추워서 걱정입니다.',
    time: '방금 전',
    badge: '챌린지 인증 표시',
  },
  {
    title: '물통 확인하기',
    description: '물통이 얼어서 깨끗이 씻었습니다.',
    time: '어제',
  },
];

export const CHALLENGE_DETAIL_DUMMY_DIARIES: ChallengeDiaryDummyItem[] = [
  {
    diaryId: 10001,
    createdAt: '2026-03-05T07:30:00+09:00',
    title: '아침 루틴 인증',
    imageUrl: '/images/default-card.png',
    user: '챌린저_민준',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '방금 전',
    emotion: 'happy',
    percent: 100,
    isLiked: true,
    likes: 12,
  },
  {
    diaryId: 10002,
    createdAt: '2026-03-05T00:20:00+09:00',
    title: '퇴근 후 1시간 몰입 기록',
    imageUrl: '/images/default-card.png',
    user: '코딩하는_수아',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '7시간 전',
    emotion: 'soso',
    percent: 67,
    isLiked: false,
    likes: 8,
  },
  {
    diaryId: 10003,
    createdAt: '2026-03-04T22:15:00+09:00',
    title: '목표 체크리스트 전체 달성',
    imageUrl: '/images/default-card.png',
    user: '러너_지훈',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '9시간 전',
    emotion: 'happy',
    percent: 100,
    isLiked: true,
    likes: 17,
  },
  {
    diaryId: 10004,
    createdAt: '2026-03-04T19:40:00+09:00',
    title: '주간 회고 및 다음 계획',
    imageUrl: '/images/default-card.png',
    user: '성장하는_하린',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '12시간 전',
    emotion: 'happy',
    percent: 80,
    isLiked: false,
    likes: 5,
  },
  {
    diaryId: 10005,
    createdAt: '2026-03-04T15:00:00+09:00',
    title: '집중력 저하 대응 기록',
    imageUrl: '/images/default-card.png',
    user: '꾸준한_도윤',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '16시간 전',
    emotion: 'soso',
    percent: 74,
    isLiked: false,
    likes: 9,
  },
  {
    diaryId: 10006,
    createdAt: '2026-03-04T12:30:00+09:00',
    title: '챌린지 중간 점검',
    imageUrl: '/images/default-card.png',
    user: '집중모드_예린',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '19시간 전',
    emotion: 'soso',
    percent: 86,
    isLiked: true,
    likes: 11,
  },
  {
    diaryId: 10007,
    createdAt: '2026-03-04T09:10:00+09:00',
    title: '작은 단위 목표로 재설계',
    imageUrl: '/images/default-card.png',
    user: '기록왕_서윤',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '22시간 전',
    emotion: 'happy',
    percent: 92,
    isLiked: false,
    likes: 6,
  },
  {
    diaryId: 10008,
    createdAt: '2026-03-03T22:40:00+09:00',
    title: '오늘은 절반만 달성',
    imageUrl: '/images/default-card.png',
    user: '천천히_유진',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '어제',
    emotion: 'sad',
    percent: 50,
    isLiked: false,
    likes: 3,
  },
  {
    diaryId: 10009,
    createdAt: '2026-03-03T19:50:00+09:00',
    title: '기록 습관 14일 연속 유지',
    imageUrl: '/images/default-card.png',
    user: '연속성_태훈',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '어제',
    emotion: 'happy',
    percent: 100,
    isLiked: true,
    likes: 21,
  },
  {
    diaryId: 10010,
    createdAt: '2026-03-03T13:30:00+09:00',
    title: '점심시간 20분 학습 인증',
    imageUrl: '/images/default-card.png',
    user: '틈새학습_지민',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '어제',
    emotion: 'soso',
    percent: 60,
    isLiked: false,
    likes: 4,
  },
  {
    diaryId: 10011,
    createdAt: '2026-03-03T08:45:00+09:00',
    title: '아침 집중 세션 성공',
    imageUrl: '/images/default-card.png',
    user: '얼리버드_하준',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '2일 전',
    emotion: 'happy',
    percent: 95,
    isLiked: true,
    likes: 14,
  },
  {
    diaryId: 10012,
    createdAt: '2026-03-02T21:20:00+09:00',
    title: '복습 중심으로 마무리',
    imageUrl: '/images/default-card.png',
    user: '복습러_다은',
    userImage: '/images/default-profile.png',
    challengeLabel: '개발 습관',
    dateLabel: '2일 전',
    emotion: 'soso',
    percent: 78,
    isLiked: false,
    likes: 7,
  },
];

export const CHALLENGE_DETAIL_WEEK_LABELS = [
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
];
