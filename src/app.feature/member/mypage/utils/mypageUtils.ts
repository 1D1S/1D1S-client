import { getCategoryLabel } from '@constants/categories';
import type { DiaryItem } from '@feature/diary/board/type/diary';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import { getRelativeDiaryDateLabel } from '@feature/diary/shared/utils/diaryRelativeTime';
import {
  type DiaryEmotion,
  mapFeelingToEmotion,
} from '@feature/diary/shared/utils/feeling';
import type {
  MyPageStreak,
  StreakCalendarItem,
} from '@feature/member/type/member';

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
  emoji: string;
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

function toLocalDateKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function toRelativeDateLabel(createdAt: string | undefined): string {
  return getRelativeDiaryDateLabel(createdAt ?? '', '최근');
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

/**
 * 7행 × 20열 (총 140일) 활동 잔디용 데이터를 오늘 기준 과거 순으로 생성한다.
 * 각 셀의 count 는 0~4 레벨로 클램프되어 DS Streak 그라데이션과 매핑된다.
 */
export function buildHeatmapData(
  calendar: StreakCalendarItem[]
): StreakCalendarItem[] {
  const calendarMap = new Map(
    calendar.map((item) => [item.date, item.count])
  );
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (HEATMAP_TOTAL_DAYS - 1));

  const result: StreakCalendarItem[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const dateStr = toLocalDateKey(cursor);
    const count = calendarMap.get(dateStr) ?? 0;
    result.push({ date: dateStr, count: toHeatmapLevel(count) });
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
      emoji: '🔥',
      label: `${Math.max(currentStreak, 7)}일 연속`,
      tone: 'peach',
    },
    {
      id: 'first-finish',
      emoji: '🏆',
      label: '첫 완주',
      tone: 'main',
    },
    {
      id: 'diary-30',
      emoji: '📖',
      label: '30개 일지',
      tone: 'green',
    },
    {
      id: 'challenge-3',
      emoji: '🎯',
      label: '챌린지 3개',
      tone: 'blue',
    },
    {
      id: 'streak-30',
      emoji: '🌱',
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

/**
 * 챌린지 진행률 계산 — 시작일 ~ 종료일 사이에서 오늘이 차지하는 비율.
 */
export function getChallengeProgressInfo(
  startDate: string,
  endDate: string,
  isInfinite: boolean
): { progress: number; daysElapsed: number; totalDays: number } {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return { progress: 0, daysElapsed: 0, totalDays: 0 };
  }
  const totalDays = Math.max(
    1,
    Math.round((end - start) / dayMs) + 1,
  );
  const daysElapsed = Math.max(
    0,
    Math.min(totalDays, Math.floor((now - start) / dayMs) + 1),
  );
  if (isInfinite) {
    return { progress: 100, daysElapsed, totalDays };
  }
  const progress = Math.max(
    0,
    Math.min(100, Math.round((daysElapsed / totalDays) * 100)),
  );
  return { progress, daysElapsed, totalDays };
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
