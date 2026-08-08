/**
 * 주어진 날짜를 그 날의 00:00:00.000 로컬 시간으로 정규화해 반환한다.
 * 날짜 비교 시 시간 성분으로 인한 오차를 제거하기 위해 사용한다.
 */
export function toStartOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

/**
 * 로컬 시간 기준 YYYY-MM-DD 문자열로 변환한다.
 * API key, 캘린더 비교 등 시간 성분이 없는 식별자가 필요할 때 사용한다.
 */
export function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * 한국어 짧은 표기 (예: "5월 13일") 로 변환한다.
 */
export function formatDateKR(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * ISO 날짜 문자열("YYYY-MM-DD…")을 "7월 6일" 로 변환한다.
 * Date 파싱을 거치지 않아 타임존에 의한 하루 밀림이 없다.
 * 형식이 아니면 빈 문자열을 반환한다.
 */
export function formatMonthDayKR(isoDate: string | undefined): string {
  const match = /^\d{4}-(\d{2})-(\d{2})/.exec(isoDate ?? '');
  if (!match) {
    return '';
  }
  return `${Number(match[1])}월 ${Number(match[2])}일`;
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('ko', {
  numeric: 'auto',
});

function isDateOnlyValue(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * 날짜 문자열을 로컬 타임존 기준 Date 로 파싱한다.
 * `YYYY-MM-DD` 를 `new Date(str)` 로 파싱하면 UTC 자정으로 해석돼
 * 음수 오프셋 타임존에서 하루가 밀린다 — 반드시 이 함수를 쓸 것.
 */
export function parseDateValue(value: string): Date | null {
  if (!value) {
    return null;
  }

  if (isDateOnlyValue(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const normalizedValue = value.includes('T') ? value : value.replace(' ', 'T');
  const parsedDate = new Date(normalizedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

/**
 * 한국어 상대 시간 라벨 (예: "방금 전", "5분 전", "어제") 로 변환한다.
 * `YYYY-MM-DD` 형식은 일 단위로, 그 외 timestamp는 분/시간/일 단위로 처리한다.
 */
export function getRelativeTimeLabel(
  value: string,
  emptyFallback = '방금 전'
): string {
  if (!value) {
    return emptyFallback;
  }

  const targetDate = parseDateValue(value);
  if (!targetDate) {
    return emptyFallback;
  }

  if (isDateOnlyValue(value)) {
    const diffDays = Math.round(
      (toStartOfDay(targetDate).getTime() -
        toStartOfDay(new Date()).getTime()) /
        86400000
    );
    return relativeTimeFormatter.format(diffDays, 'day');
  }

  const diffMinutes = Math.round((targetDate.getTime() - Date.now()) / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 1) {
    return '방금 전';
  }

  if (absMinutes < 60) {
    return relativeTimeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(diffDays, 'day');
}

/**
 * 비교/정렬용 epoch ms 를 반환한다. 파싱 실패 시 0을 반환한다.
 */
export function getDateTimestamp(value: string): number {
  return parseDateValue(value)?.getTime() ?? 0;
}

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * 시작~종료 양끝 포함 일수 (예: 8/1~8/7 → 7). 화면마다 ceil / round+1 이
 * 제각각이라 같은 기간이 7일/8일로 다르게 보이던 것을 이 함수로 통일한다.
 * 파싱 실패 또는 종료일 < 시작일이면 null.
 */
export function getInclusiveDayCount(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): number | null {
  const start = startDate ? parseDateValue(startDate) : null;
  const end = endDate ? parseDateValue(endDate) : null;
  if (!start || !end) {
    return null;
  }
  const diff = Math.round(
    (toStartOfDay(end).getTime() - toStartOfDay(start).getTime()) / MS_PER_DAY
  );
  return diff < 0 ? null : diff + 1;
}
