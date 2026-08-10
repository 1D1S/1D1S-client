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
