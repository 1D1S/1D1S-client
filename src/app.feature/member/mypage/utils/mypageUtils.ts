import { getCategoryLabel } from '@constants/categories';
import type { DiaryItem } from '@feature/diary/board/type/diary';
import { getRelativeDiaryDateLabel } from '@feature/diary/shared/utils/diaryRelativeTime';
import type { StreakCalendarItem } from '@feature/member/type/member';

export type DiaryEmotion = 'happy' | 'soso' | 'sad';
type Feeling = 'HAPPY' | 'NORMAL' | 'SAD' | 'NONE';

export interface DiaryCardViewModel {
  id: number;
  title: string;
  imageUrl: string;
  percent: number;
  isLiked: boolean;
  likes: number;
  commentCount: number;
  user: string;
  userImage: string;
  challengeLabel: string;
  challengeId: number | undefined;
  date: string;
  emotion: DiaryEmotion;
}

function toLocalDateKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function buildYearStreak(
  calendar: StreakCalendarItem[]
): StreakCalendarItem[] {
  const today = new Date();
  const calendarMap = new Map(
    calendar.map((item) => [item.date, item.count])
  );
  const result: StreakCalendarItem[] = [];
  const cursor = new Date(today.getFullYear(), 0, 1);

  while (cursor <= today) {
    const dateStr = toLocalDateKey(cursor);
    result.push({ date: dateStr, count: calendarMap.get(dateStr) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

export function mapFeelingToEmotion(feeling: Feeling): DiaryEmotion {
  switch (feeling) {
    case 'HAPPY':
      return 'happy';
    case 'SAD':
      return 'sad';
    case 'NORMAL':
    case 'NONE':
    default:
      return 'soso';
  }
}

function toRelativeDateLabel(createdAt: string | undefined): string {
  return getRelativeDiaryDateLabel(createdAt ?? '', '최근');
}

function resolveDiaryImage(diary: DiaryItem): string {
  if (Array.isArray(diary.imgUrl) && diary.imgUrl.length > 0) {
    return diary.imgUrl[0] ?? '/images/default-card.png';
  }
  return '/images/default-card.png';
}

export function getLongestGoalStreakSummary(
  longestGoalStreak: Array<Record<string, number>> | undefined
): { goalTitle: string; streakCount: number } {
  const firstEntry = longestGoalStreak?.[0];
  if (!firstEntry) {
    return { goalTitle: '아직 기록이 없어요', streakCount: 0 };
  }
  const [goalTitle, streakCount] = Object.entries(firstEntry)[0] ?? [
    '아직 기록이 없어요',
    0,
  ];
  return { goalTitle, streakCount };
}

export function buildDiaryCardViewModels(
  diaries: DiaryItem[],
  nickname: string,
  profileUrl: string
): DiaryCardViewModel[] {
  return diaries.map((diary) => {
    const diaryInfo = diary.diaryInfoDto;
    const achievementRate =
      diary.achievementRate ?? diaryInfo?.achievementRate ?? 0;

    return {
      id: diary.id,
      title: diary.title || '제목 없는 일지',
      imageUrl: resolveDiaryImage(diary),
      percent: Math.min(100, Math.max(0, achievementRate)),
      isLiked: diary.likeInfo.likedByMe,
      likes: diary.likeInfo.likeCnt,
      commentCount: diary.commentCount,
      user: nickname || '나',
      userImage: profileUrl || '/images/default-profile.png',
      challengeLabel:
        diary.challenge?.title ||
        getCategoryLabel(diary.challenge?.category) ||
        '나의 일지',
      challengeId: diary.challenge?.challengeId,
      date: toRelativeDateLabel(diaryInfo?.createdAt),
      emotion: mapFeelingToEmotion(diaryInfo?.feeling ?? 'NONE'),
    };
  });
}
