export const CATEGORY_OPTIONS = [
  { value: 'DEV', label: '개발', icon: '💻' },
  { value: 'EXERCISE', label: '운동', icon: '💪' },
  { value: 'BOOK', label: '독서', icon: '📚' },
  { value: 'MUSIC', label: '음악', icon: '🎶' },
  { value: 'STUDY', label: '공부', icon: '🖊️' },
  { value: 'LEISURE', label: '여가생활', icon: '🍿' },
  { value: 'ECONOMY', label: '경제', icon: '💵' },
];

const EXTRA_CATEGORY_LABELS: Record<string, string> = {
  ALL: '전체',
  OTHER: '기타',
  HEALTH: '건강',
  HOBBY: '취미',
};

const CATEGORY_LABELS: Record<string, string> = CATEGORY_OPTIONS.reduce(
  (labels, option) => {
    labels[option.value] = option.label;
    return labels;
  },
  { ...EXTRA_CATEGORY_LABELS }
);

export function getCategoryLabel(category?: string | null): string {
  if (!category) {
    return '';
  }

  return CATEGORY_LABELS[category] ?? category;
}
