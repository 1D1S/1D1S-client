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
  diaryInfo: DiaryInfo;
}
