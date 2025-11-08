export type Feeling = 'SAD' | 'NORMAL' | 'HAPPY' | 'NONE';
export type ReportType = 'ETC';

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
  challengeType: string;
  participantCnt: number;
  likeInfo: LikeInfo;
}

export interface DiaryInfo {
  createdAt: string;
  challengedDate: string;
  feeling: Feeling;
  achievement: number[] | null;
  achievementRate: number;
}

export interface DiaryItem {
  id: number;
  challenge?: ChallengeSummary;
  authorInfo: AuthorInfo;
  title: string;
  content: string;
  imgUrl: string | null;
  isPublic: boolean;
  likeInfo: LikeInfo;
  diaryInfo: DiaryInfo;
}

export interface DiaryDetail extends DiaryItem {
  challenge: ChallengeSummary;
  img?: Array<{ url: string }>;
}

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

export interface RandomDiaryParams {
  size?: number;
}

export interface CreateDiaryReportRequest {
  diaryId: number;
  content: string;
  reportType: ReportType;
}

export interface UploadImageResponse {
  message: string;
  data: string;
}

export interface UploadImagesResponse {
  message: string;
  data: string[];
}
