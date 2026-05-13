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
