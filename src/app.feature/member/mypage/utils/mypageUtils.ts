import { getCategoryLabel } from '@constants/categories';
import type { DiaryItem } from '@feature/diary/board/type/diary';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import {
  type DiaryEmotion,
  mapFeelingToEmotion,
} from '@feature/diary/shared/utils/feeling';
import type {
  MyPageStreak,
  StreakCalendarItem,
} from '@feature/member/type/member';
import { formatDateISO, getRelativeTimeLabel } from '@module/utils/date';

export type { DiaryEmotion };

const HEATMAP_ROWS = 7;
const HEATMAP_COLS = 20;
const HEATMAP_TOTAL_DAYS = HEATMAP_ROWS * HEATMAP_COLS;

export type AchievementBadgeTone =
  | 'main'
  | 'peach'
  | 'mint'
  | 'blue'
  | 'green'
  | 'gray';

export interface MyPageBadge {
  id: string;
  label: string;
  tone: AchievementBadgeTone;
  achieved: boolean;
}

export interface DiaryCardViewModel {
  id: number;
  title: string;
  imageUrl: string | undefined;
  profileImageUrl: string | undefined;
  percent: number;
  isLiked: boolean;
  likes: number;
  user: string;
  challengeLabel: string;
  date: string;
  emotion: DiaryEmotion;
}

function toRelativeDateLabel(createdAt: string | undefined): string {
  return getRelativeTimeLabel(createdAt ?? '', '최근');
}

function resolveDiaryImage(diary: DiaryItem): string | undefined {
  if (Array.isArray(diary.imgUrl) && diary.imgUrl.length > 0) {
    return diary.imgUrl[0];
  }
  return undefined;
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

function toHeatmapLevel(count: number): number {
  if (count <= 0) {
    return 0;
  }
  if (count === 1) {
    return 1;
  }
  if (count === 2) {
    return 2;
  }
  if (count === 3) {
    return 3;
  }
  return 4;
}

export interface HeatmapEntry {
  date: string;
  count: number;
  level: number;
}

/**
 * 7행 × 20열 (총 140일) 활동 잔디용 데이터를 오늘 기준 과거 순으로 생성한다.
 * 각 셀의 level 은 0~4 로 클램프되어 DS Heatmap 그라데이션과 매핑되며,
 * count 는 원본 활동 횟수 그대로 보존해 툴팁 표시에 사용한다.
 */
export function buildHeatmapData(
  calendar: StreakCalendarItem[]
): HeatmapEntry[] {
  const calendarMap = new Map(calendar.map((item) => [item.date, item.count]));
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (HEATMAP_TOTAL_DAYS - 1));

  const result: HeatmapEntry[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const dateStr = formatDateISO(cursor);
    const count = calendarMap.get(dateStr) ?? 0;
    result.push({ date: dateStr, count, level: toHeatmapLevel(count) });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

/**
 * 마이페이지 배지 5종 — streak 지표를 임계값 기반으로 달성 여부 판정.
 * 미달성 배지도 표시하되 톤을 회색으로 낮춘다.
 */
export function buildMyPageBadges(streak: MyPageStreak): MyPageBadge[] {
  const currentStreak = streak.currentStreak ?? 0;
  const maxStreak = streak.maxStreak ?? 0;
  const totalDiaryCount = streak.totalDiaryCount ?? 0;
  const completedFiniteCount = streak.completedFiniteChallengeCount ?? 0;
  const totalChallengeCount = streak.totalChallengeCount ?? 0;

  const definitions: Array<Omit<MyPageBadge, 'achieved'>> = [
    {
      id: 'streak-7',
      label: `${Math.max(currentStreak, 7)}일 연속`,
      tone: 'peach',
    },
    {
      id: 'first-finish',
      label: '첫 완주',
      tone: 'main',
    },
    {
      id: 'diary-30',
      label: '30개 일지',
      tone: 'green',
    },
    {
      id: 'challenge-3',
      label: '챌린지 3개',
      tone: 'blue',
    },
    {
      id: 'streak-30',
      label: '30일 스트릭',
      tone: 'mint',
    },
  ];

  const achieved: Record<string, boolean> = {
    'streak-7': currentStreak >= 7 || maxStreak >= 7,
    'first-finish': completedFiniteCount >= 1,
    'diary-30': totalDiaryCount >= 30,
    'challenge-3': totalChallengeCount >= 3,
    'streak-30': maxStreak >= 30,
  };

  return definitions.map((badge) => {
    const isAchieved = achieved[badge.id] ?? false;
    return {
      ...badge,
      achieved: isAchieved,
      tone: isAchieved ? badge.tone : 'gray',
    };
  });
}

export function buildDiaryCardViewModels(
  diaries: DiaryItem[],
  nickname: string
): DiaryCardViewModel[] {
  return diaries.map((diary) => {
    const diaryInfo = diary.diaryInfoDto;
    const achievementRate =
      diary.achievementRate ?? diaryInfo?.achievementRate ?? 0;

    return {
      id: diary.id,
      title: diary.title || '제목 없는 일지',
      imageUrl: resolveDiaryImage(diary),
      profileImageUrl:
        resolveDiaryImageUrl(diary.authorInfoDto?.profileImage) ?? undefined,
      percent: Math.min(100, Math.max(0, achievementRate)),
      isLiked: diary.likeInfo.likedByMe,
      likes: diary.likeInfo.likeCnt,
      user: nickname || '나',
      challengeLabel:
        diary.challenge?.title ||
        getCategoryLabel(diary.challenge?.category) ||
        '나의 일지',
      date: toRelativeDateLabel(diaryInfo?.createdAt),
      emotion: mapFeelingToEmotion(diaryInfo?.feeling ?? 'NONE'),
    };
  });
}
