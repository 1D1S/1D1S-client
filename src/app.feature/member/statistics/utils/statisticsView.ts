import type { Feeling } from '@feature/diary/board/type/diary';

// 감정 표시 메타 — 라벨/아이콘/차트 색(colors.css 변수).
export const FEELING_ORDER: Feeling[] = ['HAPPY', 'NORMAL', 'SAD', 'NONE'];

export const FEELING_LABEL: Record<Feeling, string> = {
  HAPPY: '좋음',
  NORMAL: '보통',
  SAD: '아쉬움',
  NONE: '미선택',
};

// 감정 아이콘 — 일지 화면과 동일한 무드 SVG(/images/mood-*.svg).
// NONE(미선택)은 대응 아이콘이 없어 null.
export const FEELING_MOOD_IMAGE: Record<
  Feeling,
  { src: string; alt: string } | null
> = {
  HAPPY: { src: '/images/mood-happy.svg', alt: '좋음' },
  NORMAL: { src: '/images/mood-soso.svg', alt: '보통' },
  SAD: { src: '/images/mood-sad.svg', alt: '아쉬움' },
  NONE: null,
};

// SVG/inline 스타일용 색상 (colors.css 토큰 참조).
// 무드 SVG 아이콘의 실제 색과 맞춘다 —
// 좋음=피치(main), 보통=민트(mint), 아쉬움=블루(blue).
export const FEELING_COLOR: Record<Feeling, string> = {
  HAPPY: 'var(--main-500)',
  NORMAL: 'var(--mint-500)',
  SAD: 'var(--blue-400)',
  NONE: 'var(--gray-300)',
};

// 감정별 soft 배경 / 강조 텍스트색 — 레전드·칩 무드 컬러 시스템.
// 팔레트에 파스텔 단계가 없어 color-mix 로 흰색과 섞어 연하게 만든다.
export const FEELING_SOFT_BG: Record<Feeling, string> = {
  HAPPY: 'color-mix(in srgb, var(--main-500) 22%, white)',
  NORMAL: 'color-mix(in srgb, var(--mint-500) 20%, white)',
  SAD: 'color-mix(in srgb, var(--blue-400) 14%, white)',
  NONE: 'var(--gray-50)',
};

export const FEELING_FG: Record<Feeling, string> = {
  HAPPY: 'var(--main-700)',
  NORMAL: 'var(--mint-900)',
  SAD: 'var(--blue-500)',
  NONE: 'var(--gray-500)',
};

export function formatPercent(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return '0%';
  }
  return `${Math.round(ratio * 100)}%`;
}

// 소수가 섞일 수 있는 값 표시 — 최대 1자리, 정수는 소수점 제거.
// (NaN 방어 포함) 통계 카운트 표시에 사용한다.
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
