import { toStartOfDay } from '@module/utils/date';

const STREAK_START_DATE = new Date(2026, 4, 20);

export function getLaunchStreakDay(): number {
  const start = toStartOfDay(STREAK_START_DATE).getTime();
  const today = toStartOfDay(new Date()).getTime();
  const days = Math.floor((today - start) / 86_400_000) + 1;
  return Math.max(1, days);
}
