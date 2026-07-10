import type { Feeling } from '@feature/diary/board/type/diary';

// 감정 표시 메타 — 라벨/이모지/차트 색(colors.css 변수).
export const FEELING_ORDER: Feeling[] = ['HAPPY', 'NORMAL', 'SAD', 'NONE'];

export const FEELING_LABEL: Record<Feeling, string> = {
  HAPPY: '좋음',
  NORMAL: '보통',
  SAD: '아쉬움',
  NONE: '미선택',
};

export const FEELING_EMOJI: Record<Feeling, string> = {
  HAPPY: '😊',
  NORMAL: '😌',
  SAD: '🥲',
  NONE: '⚪',
};

// SVG/inline 스타일용 색상 (colors.css 토큰 참조).
export const FEELING_COLOR: Record<Feeling, string> = {
  HAPPY: 'var(--main-500)',
  NORMAL: 'var(--blue-400)',
  SAD: 'var(--red-400)',
  NONE: 'var(--gray-300)',
};

export function formatPercent(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return '0%';
  }
  return `${Math.round(ratio * 100)}%`;
}

// 평균 등 소수가 섞일 수 있는 값 표시 — 최대 1자리, 정수는 소수점 제거.
// friendsAverage 처럼 서버가 실수를 내려줄 수 있는 값에 사용한다.
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return String(Math.round(value * 10) / 10);
}

// 증감값 표시 — +N / -N / ±0.
export function formatDelta(delta: number): string {
  if (delta > 0) {
    return `+${delta}`;
  }
  if (delta < 0) {
    return `${delta}`;
  }
  return '±0';
}

// bucket 문자열을 사람이 읽는 짧은 라벨로. 서버 포맷을 방어적으로 처리한다.
export function formatBucketLabel(bucket: string): string {
  if (!bucket) {
    return '';
  }
  // YYYY-MM-DD → M/D
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bucket);
  if (day) {
    return `${Number(day[2])}/${Number(day[3])}`;
  }
  // YYYY-MM → M월
  const month = /^(\d{4})-(\d{2})$/.exec(bucket);
  if (month) {
    return `${Number(month[2])}월`;
  }
  // YYYY-Www → W주
  const week = /^(\d{4})-W(\d{1,2})$/.exec(bucket);
  if (week) {
    return `${Number(week[2])}주`;
  }
  return bucket;
}
