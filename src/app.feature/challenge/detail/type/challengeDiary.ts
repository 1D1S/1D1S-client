import {
  AuthorInfo,
  ChallengeSummary,
  DiaryInfo,
  LikeInfo,
} from '@feature/diary/board/type/diary';

export interface ChallengeDiaryItem {
  id: number;
  challenge: ChallengeSummary;
  author: AuthorInfo;
  title: string;
  content: string;
  imgUrl: string[];
  isPublic: boolean;
  likeInfo: LikeInfo;
  commentCount: number;
  diaryInfo: DiaryInfo;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ChallengeDiaryListResponse {
  items: ChallengeDiaryItem[];
  pageInfo: PageInfo;
}
