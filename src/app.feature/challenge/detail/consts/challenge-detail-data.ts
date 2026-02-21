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

export const CHALLENGE_DETAIL_WEEK_LABELS = [
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
];
