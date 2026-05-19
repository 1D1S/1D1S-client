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
  ALL: '#ff7043',
  DEV: '#7c3aed',
  EXERCISE: '#ff7043',
  BOOK: '#3eb489',
  MUSIC: '#1666ba',
  STUDY: '#a78bfa',
  LEISURE: '#ff9800',
  ECONOMY: '#3eb489',
  HEALTH: '#3eb489',
  HOBBY: '#ff9800',
  OTHER: '#ff7043',
};

const DEFAULT_STRIPE_TONE = '#ff7043';

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
