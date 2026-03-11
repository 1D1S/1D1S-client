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
