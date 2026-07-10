import type { DiaryItem } from '@feature/diary/board/type/diary';
import { resolveDiaryImageList } from '@module/utils/diaryImageUrl';

export type DiaryItemApi = Omit<DiaryItem, 'authorInfoDto' | 'diaryInfoDto'> & {
  authorInfoDto?: DiaryItem['authorInfoDto'] | null;
  diaryInfoDto?: DiaryItem['diaryInfoDto'] | null;
  author?: DiaryItem['authorInfoDto'] | null;
  diaryInfo?: DiaryItem['diaryInfoDto'] | null;
  imgUrl?: string[] | string | null;
  thumbnailUrl?: string | null;
};

export function normalizeDiaryItem(item: DiaryItemApi): DiaryItem {
  const { author, diaryInfo, authorInfoDto, diaryInfoDto, ...rest } = item;
  return {
    ...rest,
    imgUrl: resolveDiaryImageList(item.imgUrl),
    thumbnailUrl: item.thumbnailUrl ?? null,
    authorInfoDto: authorInfoDto ?? author ?? null,
    diaryInfoDto: diaryInfoDto ?? diaryInfo ?? null,
  };
}

export function normalizeDiaryItems(items: DiaryItemApi[]): DiaryItem[] {
  return items.map(normalizeDiaryItem);
}
