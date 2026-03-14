'use client';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('ko', {
  numeric: 'auto',
});

function isDateOnlyValue(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseDateValue(value: string): Date | null {
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

function toStartOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

export function getRelativeDiaryDateLabel(
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
      (
        toStartOfDay(targetDate).getTime() - toStartOfDay(new Date()).getTime()
      ) / 86400000
    );
    return relativeTimeFormatter.format(diffDays, 'day');
  }

  const diffMinutes = Math.round(
    (targetDate.getTime() - Date.now()) / 60000
  );
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

export function getDateTimestamp(value: string): number {
  return parseDateValue(value)?.getTime() ?? 0;
}
