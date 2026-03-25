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
}

export interface MemberProfileData {
  nickname: string;
  profileUrl: string;
  streak: MyPageStreak;
  challengeList: MyPageChallenge[];
  diaryList: MyPageDiary[];
}

export interface MyPageData {
  nickname: string;
  profileUrl: string;
  email: string;
  provider: 'GOOGLE' | 'KAKAO' | 'NAVER';
  streak: MyPageStreak;
  challengeList: MyPageChallenge[];
  diaryList: MyPageDiary[];
}
