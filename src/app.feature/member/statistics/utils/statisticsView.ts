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

export interface TrendPoint {
  /** 컨테이너 폭 대비 x 위치(%) */
  xPct: number;
  /** 컨테이너 높이 대비 y 위치(%) — 0 이 상단, 100 이 하단 */
  yPct: number;
}

// 꺾은선 좌표 매핑. 컨테이너 실제 폭/높이와 무관한 % 좌표로 반환해
// SVG(preserveAspectRatio="none") 선과 HTML 오버레이 점이 같은 좌표를
// 공유하게 한다 — SVG 비균등 스케일이 점을 타원으로 찌그러뜨리지 않는다.
// - x: 균등 분할. 단일 포인트는 가운데(50%).
// - y: max 대비 비율. max<=0(전부 0)이면 division 없이 바닥 라인으로 평탄화.
//   음수 count 는 0 으로 클램프.
// topPad/bottomPad(%) 로 상단 값 라벨 여백과 하단 축 여백을 확보한다.
export function computeTrendPoints(
  counts: number[],
  max: number,
  topPad = 16,
  bottomPad = 12,
): TrendPoint[] {
  const band = Math.max(0, 100 - topPad - bottomPad);
  const lastIndex = counts.length - 1;
  return counts.map((count, index) => {
    const xPct = lastIndex <= 0 ? 50 : (index / lastIndex) * 100;
    const ratio = max > 0 ? Math.max(0, count) / max : 0;
    const yPct = topPad + (1 - ratio) * band;
    return { xPct, yPct };
  });
}

// ISO 주차 키(YYYY-Www) — 서버가 IsoFields/WeekFields.ISO 로 주 버킷을
// 만든다고 가정한다. 목요일 기준으로 주를 결정하는 표준 ISO-8601 규칙.
// ponytail: 서버 주차 스킴이 ISO 가 아니면 WEEK 강조만 조용히 빠진다(오강조는
// 없음). 어긋나면 서버 스킴에 맞춰 이 함수만 교체.
function isoWeekParts(date: Date): { year: number; week: number } {
  // 로컬 날짜를 UTC 자정으로 정규화해 DST/시간 성분 영향을 제거한다.
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  // ISO 요일: 월=0 … 일=6. 해당 주의 목요일로 이동해 주-소속 연도를 정한다.
  const isoDay = (utc.getUTCDay() + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - isoDay + 3);
  const firstThursday = new Date(Date.UTC(utc.getUTCFullYear(), 0, 4));
  const firstIsoDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstIsoDay + 3);
  const week =
    1 + Math.round((utc.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return { year: utc.getUTCFullYear(), week };
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

// buckets 중 "오늘(현재 구간)"이 속한 버킷의 인덱스. 없으면 -1(과거 기간 조회 등).
// 버킷 포맷을 첫 항목으로 판별한다:
//   YYYY-MM-DD(일) · YYYY-MM(월) · YYYY-Www(ISO 주).
// 최댓값 버킷이 아니라 "지금 위치"를 강조하기 위한 매핑이라 순수 함수로 분리해
// now 를 주입받는다(테스트 결정성 확보).
export function findCurrentBucketIndex(buckets: string[], now: Date): number {
  const [sample] = buckets;
  if (!sample) {
    return -1;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(sample)) {
    const key = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(
      now.getDate()
    )}`;
    return buckets.indexOf(key);
  }
  if (/^\d{4}-\d{2}$/.test(sample)) {
    const key = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
    return buckets.indexOf(key);
  }
  const isoWeek = /^(\d{4})-W(\d{1,2})$/.exec(sample);
  if (isoWeek) {
    const { year, week } = isoWeekParts(now);
    // 서버가 zero-pad 를 하든 안 하든 숫자로 비교한다.
    return buckets.findIndex((bucket) => {
      const parsed = /^(\d{4})-W(\d{1,2})$/.exec(bucket);
      return (
        parsed !== null &&
        Number(parsed[1]) === year &&
        Number(parsed[2]) === week
      );
    });
  }
  return -1;
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
