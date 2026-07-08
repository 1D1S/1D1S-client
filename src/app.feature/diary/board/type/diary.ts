import type { LikeInfo } from '@module/api/types';

export type { LikeInfo };

export type Feeling = 'SAD' | 'NORMAL' | 'HAPPY' | 'NONE';
export type ReportType = 'BAD_TITLE_CONTENT' | 'BAD_IMAGE' | 'ETC';

export interface AuthorInfo {
  id: number;
  nickname: string | null;
  profileImage: string | null;
}

export interface ChallengeSummary {
  challengeId: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  maxParticipantCnt: number;
  goalType: string;
  participationType: string;
  participantCnt: number;
  thumbnailImage?: string | null;
  likeInfo: LikeInfo;
}

export interface DiaryGoalStatus {
  challengeGoalId: number;
  challengeGoalName: string;
  isAchieved: boolean;
}

export interface DiaryInfo {
  createdAt: string;
  challengedDate: string;
  feeling: Feeling;
  diaryGoal: DiaryGoalStatus[] | null;
  achievementRate: number;
  /** @deprecated 백엔드 응답이 diaryGoal로 변경됨. 하위호환용 */
  achievement?: number[] | null;
}

export interface DiaryItem {
  id: number;
  challenge: ChallengeSummary | null;
  authorInfoDto: AuthorInfo | null;
  /** @deprecated Use authorInfoDto */
  author?: AuthorInfo | null;
  title: string;
  content: string;
  imgUrl: string[] | null;
  // 대표 썸네일(imgUrl 중 하나). 미지정이면 null — 목록/카드는 대표가
  // 없으면 이미지를 표시하지 않는다(imgUrl[0] 폴백 없음).
  thumbnailUrl: string | null;
  isPublic: boolean;
  likeInfo: LikeInfo;
  commentCount: number;
  achievementRate?: number;
  diaryInfoDto: DiaryInfo | null;
  /** @deprecated Use diaryInfoDto */
  diaryInfo?: DiaryInfo | null;
}

export type DiaryDetail = DiaryItem;

export interface CreateDiaryRequest {
  challengeId: number;
  title: string;
  content: string;
  feeling: Feeling;
  isPublic: boolean;
  achievedDate: string;
  achievedGoalIds: number[];
  // presigned 업로드로 받은 fileUrl 목록 (버킷 prefix URL 만 허용)
  imageUrls: string[];
  // 대표 썸네일 — 반드시 imageUrls 안의 값. imageUrls 가 비면 생략(보내면
  // DIARY-009). null 이면 서버가 imageUrls[0] 자동 지정.
  thumbnailUrl?: string | null;
}

export type CreateDiaryResponse = DiaryItem;

export interface UpdateDiaryRequest {
  challengeId: number;
  title: string;
  content: string;
  feeling: Feeling;
  isPublic: boolean;
  achievedGoalIds: number[];
  achievedDate: string;
  // 전체 덮어쓰기(clear-and-replace) — 유지할 기존 URL + 신규 fileUrl 을
  // 모두 명시적으로 담아 보낸다. 빈 배열이면 이미지 전체 삭제.
  imageUrls: string[];
  // 대표 썸네일 — imageUrls 안의 값이어야 함. imageUrls 가 비면 생략.
  // 썸네일은 imageUrls 를 보낼 때만 재계산되므로 항상 함께 보낸다.
  thumbnailUrl?: string | null;
}

export type UpdateDiaryResponse = DiaryDetail;

export interface DiaryListResponse {
  items: DiaryItem[];
  pageInfo: {
    limit: number;
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

export interface DiaryListParams {
  size?: number;
  cursor?: string;
}

export interface DiarySimplePageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface MyDiariesResponse {
  items: DiaryItem[];
  pageInfo: DiarySimplePageInfo;
}

export interface RandomDiaryParams {
  size?: number;
}

export interface CreateDiaryReportRequest {
  diaryId: number;
  content: string;
  reportType: ReportType;
}
