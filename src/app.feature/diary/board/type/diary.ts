export type Feeling = 'SAD' | 'NORMAL' | 'HAPPY' | 'NONE';
export type ReportType = 'BAD_TITLE_CONTENT' | 'BAD_IMAGE' | 'ETC';

export interface LikeInfo {
  likedByMe: boolean;
  likeCnt: number;
}

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
  title: string;
  content: string;
  imgUrl: string[] | null;
  isPublic: boolean;
  likeInfo: LikeInfo;
  commentCount: number;
  achievementRate?: number;
  diaryInfoDto: DiaryInfo | null;
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

export interface UploadImageResponse {
  imageUrl: string;
}

export interface UploadImagesResponse {
  imageUrls: string[];
}
