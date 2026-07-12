import { formatDateISO } from '@module/utils/date';

import { ChallengeDiaryTrendPoint } from '../type/challengeStatistics';

// 'YYYY-MM-DD' → 로컬 Date. new Date(str) 의 UTC 파싱으로 인한 하루 시프트를
// 막기 위해 연/월/일을 직접 분해해 로컬 자정으로 만든다.
export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export interface DiaryTrendSummary {
  total: number; // 전체 일지 수
  max: number; // 최다 일지 수(막대 스케일 기준). 최소 1.
  peakIndex: number; // 최다 일지 날짜의 인덱스. 비어있으면 -1.
}

// 날짜별 일지 추이 막대 차트용 요약 — 합계·최댓값·피크 인덱스.
export function summarizeDiaryTrend(
  trend: ChallengeDiaryTrendPoint[]
): DiaryTrendSummary {
  if (trend.length === 0) {
    return { total: 0, max: 1, peakIndex: -1 };
  }
  let total = 0;
  let peakIndex = 0;
  trend.forEach((point, index) => {
    total += point.count;
    if (point.count > trend[peakIndex].count) {
      peakIndex = index;
    }
  });
  const max = Math.max(trend[peakIndex].count, 1);
  // 피크 값이 0이면(전부 0개) 강조할 날짜가 없다.
  return { total, max, peakIndex: trend[peakIndex].count > 0 ? peakIndex : -1 };
}

export interface TrendProgress {
  currentDay: number; // 오늘까지 경과 일수(1-base). 시작 전이면 0.
  totalDays: number; // 챌린지 총 일수(무기한이면 오늘까지).
}

// diaryTrend 는 챌린지 기간(무기한이면 ~오늘)을 하루 단위로 덮으므로,
// 총 일수와 오늘까지의 경과 일수를 인덱스로 계산한다.
export function getTrendProgress(
  trend: ChallengeDiaryTrendPoint[],
  today: Date = new Date()
): TrendProgress {
  const totalDays = trend.length;
  if (totalDays === 0) {
    return { currentDay: 0, totalDays: 0 };
  }
  const todayIso = formatDateISO(today);
  const todayIndex = trend.findIndex((point) => point.date === todayIso);
  if (todayIndex >= 0) {
    return { currentDay: todayIndex + 1, totalDays };
  }
  // 오늘이 기간을 벗어난 경우: 마지막 날 이후면 전 기간 완료, 이전이면 시작 전.
  const startedAfterToday = todayIso < trend[0].date;
  return { currentDay: startedAfterToday ? 0 : totalDays, totalDays };
}
