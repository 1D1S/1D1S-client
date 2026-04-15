export interface SidebarChallenge {
  challengeId: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  hasDeadline?: boolean;
  periodType?: 'ENDLESS' | 'LIMITED';
  maxParticipantCnt: number;
  challengeType: string;
  participantCnt: number;
  likeInfo: {
    likedByMe: boolean;
    likeCnt: number;
  };
}

export interface SidebarData {
  nickname: string;
  profileUrl: string;
  streakCount: number;
  todayGoalCount: number;
  challengeList: SidebarChallenge[];
}

export interface StreakCalendarItem {
  date: string;
  count: number;
}

export interface MyPageStreak {
  todayGoalCount: number;
  currentStreak: number;
  totalDiaryCount: number;
  totalGoalCount: number;
  currentMonthDiaryCount: number;
  currentMonthGoalCount: number;
  maxStreak: number;
  longestGoalStreak?: Array<Record<string, number>>;
  totalChallengeCount?: number;
  completedFiniteChallengeCount?: number;
  calendar: StreakCalendarItem[];
}

export interface MyPageChallenge {
  challengeId: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  maxParticipantCnt: number;
  challengeType: string;
  participantCnt: number;
  likeInfo: {
    likedByMe: boolean;
    likeCnt: number;
  };
  thumbnailImage?: string;
}

export interface MyPageDiary {
  id: number;
  title: string;
  content: string;
  isPublic: boolean;
  likeInfo: {
    likedByMe: boolean;
    likeCnt: number;
  };
  commentCount: number;
}

export interface MemberDiaryPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface MemberDiaryListResponse {
  items: MyPageDiary[];
  pageInfo: MemberDiaryPageInfo;
}

export interface MemberProfileData {
  nickname: string;
  profileUrl: string;
  streak: MyPageStreak;
  challengeList: MyPageChallenge[];
  diaryList: MemberDiaryListResponse;
}

export interface MyPageData {
  nickname: string;
  profileUrl: string;
  email: string;
  provider: 'GOOGLE' | 'KAKAO' | 'NAVER';
  streak: MyPageStreak;
  challengeList: MyPageChallenge[];
  diaryList: MyPageDiary[];
  pageInfo?: MemberDiaryPageInfo;
}
