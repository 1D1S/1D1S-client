import {
  AuthorInfo,
  ChallengeSummary,
  DiaryInfo,
  LikeInfo,
} from '@feature/diary/board/type/diary';
import type { OffsetPageInfo as PageInfo } from '@module/api/types';

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

export type { PageInfo };

export interface ChallengeDiaryListResponse {
  items: ChallengeDiaryItem[];
  pageInfo: PageInfo;
}
