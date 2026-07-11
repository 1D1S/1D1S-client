// 'YYYY-MM-DD' → 로컬 Date. new Date(str) 의 UTC 파싱으로 인한 하루 시프트를
// 막기 위해 연/월/일을 직접 분해해 로컬 자정으로 만든다.
export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
