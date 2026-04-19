export type ChallengeCategory =
  | 'all'
  | 'development'
  | 'exercise'
  | 'reading'
  | 'design'
  | 'diet';
export type ChallengeStatus = 'recruiting' | 'closingSoon' | 'ended';

export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  category: Exclude<ChallengeCategory, 'all'>;
  status: ChallengeStatus;
  challengeType: string;
  currentParticipants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
}

export const CHALLENGE_BOARD_ITEMS_PER_PAGE = 6;

export const CHALLENGE_BOARD_CATEGORY_FILTERS: Array<{
  key: ChallengeCategory;
  label: string;
  icon?: string;
}> = [
  { key: 'all', label: '전체' },
  { key: 'development', label: '개발', icon: '💻' },
  { key: 'exercise', label: '운동', icon: '💪' },
  { key: 'reading', label: '독서', icon: '📚' },
  { key: 'design', label: '디자인', icon: '🎨' },
  { key: 'diet', label: '식단', icon: '🥗' },
];

export const CHALLENGE_BOARD_LIST: ChallengeItem[] = [
  {
    id: 'algorith-1',
    title: '알고리즘 데일리',
    description: '매일 알고리즘 문제 한 개 이상 풀기',
    category: 'development',
    status: 'recruiting',
    challengeType: '고정목표형',
    currentParticipants: 17,
    maxParticipants: 20,
    startDate: '2025-03-05',
    endDate: '2025-03-20',
  },
  {
    id: 'morning-run-1',
    title: '아침 러닝',
    description: '아침마다 3km 러닝 인증 챌린지',
    category: 'exercise',
    status: 'recruiting',
    challengeType: '인증형',
    currentParticipants: 5,
    maxParticipants: 12,
    startDate: '2025-03-10',
    endDate: '2025-03-30',
  },
  {
    id: 'read-book-1',
    title: '하루 20페이지 읽기',
    description: '하루 20페이지 독서 습관 만들기',
    category: 'reading',
    status: 'closingSoon',
    challengeType: '고정목표형',
    currentParticipants: 18,
    maxParticipants: 20,
    startDate: '2025-04-01',
    endDate: '2025-04-30',
  },
  {
    id: 'commit-1',
    title: '1일 1커밋',
    description: '작더라도 매일 커밋 남기기',
    category: 'development',
    status: 'recruiting',
    challengeType: '인증형',
    currentParticipants: 8,
    maxParticipants: 24,
    startDate: '2025-03-05',
    endDate: '2025-03-20',
  },
  {
    id: 'water-1',
    title: '하루 물 2L 마시기',
    description: '매일 물 2리터 마시기 챌린지',
    category: 'diet',
    status: 'recruiting',
    challengeType: '고정목표형',
    currentParticipants: 11,
    maxParticipants: 24,
    startDate: '2025-03-15',
    endDate: '2025-04-15',
  },
  {
    id: 'project-end-1',
    title: '사이드 프로젝트 완주',
    description: '프로젝트 기획부터 배포까지 완주',
    category: 'development',
    status: 'ended',
    challengeType: '자율목표형',
    currentParticipants: 15,
    maxParticipants: 15,
    startDate: '2025-01-01',
    endDate: '2025-03-01',
  },
  {
    id: 'ui-1',
    title: 'UI 스터디 스프린트',
    description: '매일 UI 레퍼런스 분석하고 복기하기',
    category: 'design',
    status: 'recruiting',
    challengeType: '인증형',
    currentParticipants: 9,
    maxParticipants: 20,
    startDate: '2025-03-11',
    endDate: '2025-03-31',
  },
  {
    id: 'book-club-1',
    title: '북클럽',
    description: '독서 후 핵심 요약 3줄 공유하기',
    category: 'reading',
    status: 'recruiting',
    challengeType: '고정목표형',
    currentParticipants: 12,
    maxParticipants: 18,
    startDate: '2025-03-06',
    endDate: '2025-03-26',
  },
  {
    id: 'fit-1',
    title: '노스킵 운동',
    description: '주 5회 운동 인증으로 루틴 잡기',
    category: 'exercise',
    status: 'closingSoon',
    challengeType: '인증형',
    currentParticipants: 19,
    maxParticipants: 20,
    startDate: '2025-03-01',
    endDate: '2025-03-21',
  },
  {
    id: 'meal-1',
    title: '건강 식단 챌린지',
    description: '하루 한 끼는 건강식으로 구성하기',
    category: 'diet',
    status: 'recruiting',
    challengeType: '고정목표형',
    currentParticipants: 7,
    maxParticipants: 20,
    startDate: '2025-03-09',
    endDate: '2025-03-29',
  },
  {
    id: 'brand-1',
    title: '브랜드 비주얼',
    description: '브랜딩 무드보드와 로고 시안 완성',
    category: 'design',
    status: 'recruiting',
    challengeType: '자율목표형',
    currentParticipants: 6,
    maxParticipants: 14,
    startDate: '2025-03-12',
    endDate: '2025-04-01',
  },
  {
    id: 'release-1',
    title: '함께 릴리즈',
    description: '사이드 프로젝트 릴리즈까지 함께 달리기',
    category: 'development',
    status: 'closingSoon',
    challengeType: '인증형',
    currentParticipants: 19,
    maxParticipants: 20,
    startDate: '2025-03-04',
    endDate: '2025-03-24',
  },
];

export function getChallengeCategoryLabel(
  category: ChallengeItem['category']
): string {
  if (category === 'development') {
    return '개발';
  }
  if (category === 'exercise') {
    return '운동';
  }
  if (category === 'reading') {
    return '독서';
  }
  if (category === 'design') {
    return '디자인';
  }
  return '식단';
}
