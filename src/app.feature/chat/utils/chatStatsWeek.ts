/**
 * 통계 카드의 주간 점 계산.
 *
 * 날짜는 **서버가 준 weekStart 에서 세어** 만든다. 기기 시계로 "이번 주" 를
 * 다시 구하면 박제된 주와 어긋나, 자정이나 시간대 경계에서 보는 사람마다
 * 다른 주가 그려진다. UTC 로만 다뤄 로컬 시간대에 밀리지 않게 한다.
 */
export function addDayKey(weekStart: string, offset: number): string {
  const base = new Date(`${weekStart}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) {
    return '';
  }
  base.setUTCDate(base.getUTCDate() + offset);
  return base.toISOString().slice(0, 10);
}

/** 월~일 7칸이 각각 채워지는지. */
export function weekDayFlags(
  weekStart: string,
  weekDates: string[]
): boolean[] {
  const written = new Set(weekDates);
  return Array.from({ length: 7 }, (_unused, index) =>
    written.has(addDayKey(weekStart, index))
  );
}
