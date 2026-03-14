const ENDLESS_MIN_YEAR = 2090;

export function isInfiniteChallengeEndDate(endDate?: string | null): boolean {
  const normalizedEndDate = endDate?.trim();
  if (!normalizedEndDate) {
    return false;
  }

  const parsedEndDate = new Date(normalizedEndDate);
  if (Number.isNaN(parsedEndDate.getTime())) {
    return false;
  }

  return parsedEndDate.getUTCFullYear() >= ENDLESS_MIN_YEAR;
}

function toStartOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

export function isChallengeOngoing(
  startDate?: string | null,
  endDate?: string | null,
  referenceDate: Date = new Date()
): boolean {
  if (!startDate || !endDate) {
    return false;
  }

  const start = toStartOfDay(new Date(startDate));
  const target = toStartOfDay(referenceDate);

  if (Number.isNaN(start.getTime())) {
    return false;
  }

  if (isInfiniteChallengeEndDate(endDate)) {
    return target >= start;
  }

  const end = toStartOfDay(new Date(endDate));
  if (Number.isNaN(end.getTime())) {
    return false;
  }

  return target >= start && target <= end;
}

export function isChallengeEnded(
  endDate?: string | null,
  referenceDate: Date = new Date()
): boolean {
  if (!endDate || isInfiniteChallengeEndDate(endDate)) {
    return false;
  }

  const end = toStartOfDay(new Date(endDate));
  if (Number.isNaN(end.getTime())) {
    return false;
  }

  return toStartOfDay(referenceDate) > end;
}
