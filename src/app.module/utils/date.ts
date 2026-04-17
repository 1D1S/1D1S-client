export function getYearOptions(length: number = 100): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length }, (_, i) => currentYear - i);
}

export function getMonthOptions(): number[] {
  return Array.from({ length: 12 }, (_, i) => i + 1);
}

export function getDayOptions(): number[] {
  return Array.from({ length: 31 }, (_, i) => i + 1);
}

/**
 * 주어진 날짜를 그 날의 00:00:00.000 로컬 시간으로 정규화해 반환한다.
 * 날짜 비교 시 시간 성분으로 인한 오차를 제거하기 위해 사용한다.
 */
export function toStartOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}
