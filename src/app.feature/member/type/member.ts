import type { DiaryItem } from '@feature/diary/board/type/diary';
import type { FriendRelationStatus } from '@feature/friend/type/friend';
import type {
  LikeInfo,
  OffsetPageInfo as MemberDiaryPageInfo,
} from '@module/api/types';

export interface SidebarChallenge {
  challengeId: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  hasDeadline?: boolean;
  periodType?: 'ENDLESS' | 'LIMITED';
  maxParticipantCnt: number;
  goalType: string;
  participationType: string;
  participantCnt: number;
  thumbnailImage?: string | null;
  // 종료 후 2일 유예 동안 일지 작성 허용 여부.
  postEndWriteAllowed?: boolean;
  likeInfo: LikeInfo;
}

export interface SidebarData {
  /**
   * 내 회원 id. 채팅이 "내 메시지" 와 "메시지별 안 읽은 수" 를 계산하는
   * 유일한 근거다 — 이 값이 없어 한동안 닉네임 비교로 버텼다.
   */
  memberId: number;
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
  goalType: string;
  participationType: string;
  participantCnt: number;
  // 인증샷(사진) 필수 여부(서버 JSON 키: photoRequired).
  photoRequired?: boolean;
  likeInfo: LikeInfo;
  thumbnailImage?: string;
  randomParticipants?: Array<{
    memberId: number;
    nickname: string;
    profileImg: string | null;
  }>;
}

export interface MyPageDiary {
  id: number;
  title: string;
  content: string;
  isPublic: boolean;
  likeInfo: LikeInfo;
  commentCount: number;
}

export type { MemberDiaryPageInfo };

export interface MemberDiaryListResponse {
  items: DiaryItem[];
  pageInfo: MemberDiaryPageInfo;
}

// 연동 소셜 프로바이더. 서버가 새 값을 추가할 수 있으므로 표시 로직은
// getProviderConfig() 폴백을 거쳐야 한다(APPLE 누락으로 크래시했던 이력).
export type SocialProvider = 'GOOGLE' | 'KAKAO' | 'NAVER' | 'APPLE';

export interface MemberProfileData {
  nickname: string;
  profileUrl: string;
  email?: string;
  provider?: SocialProvider;
  streak: MyPageStreak;
  challengeList: MyPageChallenge[];
  diaryList: MemberDiaryListResponse;
  relationStatus: FriendRelationStatus;
  isAccessible: boolean;
}

export interface MyPageData {
  nickname: string;
  profileUrl: string;
  email: string;
  // 미입력 회원은 응답에 키가 없다.
  phoneNumber?: string;
  provider: SocialProvider;
  streak: MyPageStreak;
  challengeList: MyPageChallenge[];
  diaryList: MyPageDiary[];
  pageInfo?: MemberDiaryPageInfo;
}
