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
