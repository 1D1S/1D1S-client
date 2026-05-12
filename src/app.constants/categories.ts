export const CATEGORY_OPTIONS = [
  { value: 'DEV', label: '개발', icon: '💻' },
  { value: 'EXERCISE', label: '운동', icon: '💪' },
  { value: 'BOOK', label: '독서', icon: '📚' },
  { value: 'MUSIC', label: '음악', icon: '🎶' },
  { value: 'STUDY', label: '공부', icon: '🖊️' },
  { value: 'LEISURE', label: '여가생활', icon: '🍿' },
  { value: 'ECONOMY', label: '경제', icon: '💵' },
];

const CATEGORY_STRIPE_TONES: Record<string, string> = {
  DEV: 'var(--blue-400)',
  EXERCISE: 'var(--main-600)',
  BOOK: 'var(--main-400)',
  MUSIC: 'var(--red-400)',
  STUDY: 'var(--blue-300)',
  LEISURE: 'var(--mint-400)',
  ECONOMY: 'var(--gray-400)',
  HEALTH: 'var(--mint-400)',
  HOBBY: 'var(--red-400)',
  OTHER: 'var(--main-400)',
  ALL: 'var(--main-400)',
};

const DEFAULT_STRIPE_TONE = 'var(--main-600)';

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

const CATEGORY_ICONS: Record<string, string> = CATEGORY_OPTIONS.reduce(
  (icons, option) => {
    icons[option.value] = option.icon;
    return icons;
  },
  {} as Record<string, string>
);

export function getCategoryLabel(category?: string | null): string {
  if (!category) {
    return '';
  }

  return CATEGORY_LABELS[category] ?? category;
}

export function getCategoryIcon(category?: string | null): string {
  if (!category) {
    return '';
  }

  return CATEGORY_ICONS[category] ?? '';
}

export function getCategoryStripeTone(category?: string | null): string {
  if (!category) {
    return DEFAULT_STRIPE_TONE;
  }

  return CATEGORY_STRIPE_TONES[category] ?? DEFAULT_STRIPE_TONE;
}
