import { Icon, type IconName } from '@1d1s/design-system';
import React, { type SVGProps } from 'react';

export const CATEGORY_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
  iconName: IconName;
}> = [
  { value: 'DEV', label: '개발', iconName: 'Code2' },
  { value: 'EXERCISE', label: '운동', iconName: 'Dumbbell' },
  { value: 'BOOK', label: '독서', iconName: 'BookOpen' },
  { value: 'MUSIC', label: '음악', iconName: 'Bell' },
  { value: 'STUDY', label: '공부', iconName: 'PencilLine' },
  { value: 'LEISURE', label: '여가생활', iconName: 'Plane' },
  { value: 'ECONOMY', label: '경제', iconName: 'Trophy' },
];

// 카테고리별 stripe/hero accent 색. 같은 보드/일지 화면에 여러 카테고리가
// 동시에 노출되므로 색이 겹치면 구분이 어렵다. 색상환을 7등분해 각 카테고리에
// 고유 hue 를 배정한다. (extras: 레거시 카테고리, 필요 시에만 사용)
const CATEGORY_STRIPE_TONES: Record<string, string> = {
  ALL: '#ff7043',
  DEV: '#7c3aed',      // violet
  STUDY: '#6366f1',    // indigo
  MUSIC: '#2563eb',    // blue
  ECONOMY: '#0d9488',  // teal
  BOOK: '#16a34a',     // green
  LEISURE: '#f59e0b',  // amber
  EXERCISE: '#ef4444', // red
  HEALTH: '#10b981',   // emerald
  HOBBY: '#ec4899',    // pink
  OTHER: '#6b7280',    // gray
};

const DEFAULT_STRIPE_TONE = '#6b7280';

const EXTRA_CATEGORY_LABELS: Record<string, string> = {
  ALL: '전체',
  OTHER: '기타',
  HEALTH: '건강',
  HOBBY: '취미',
};

const EXTRA_CATEGORY_ICON_NAMES: Record<string, IconName> = {
  ALL: 'HamburgerMenu',
  OTHER: 'Pin',
  HEALTH: 'Salad',
  HOBBY: 'Palette',
};

const CATEGORY_LABELS: Record<string, string> = CATEGORY_OPTIONS.reduce(
  (labels, option) => {
    labels[option.value] = option.label;
    return labels;
  },
  { ...EXTRA_CATEGORY_LABELS }
);

const CATEGORY_ICON_NAMES: Record<string, IconName> = CATEGORY_OPTIONS.reduce(
  (icons, option) => {
    icons[option.value] = option.iconName;
    return icons;
  },
  { ...EXTRA_CATEGORY_ICON_NAMES }
);

export function getCategoryLabel(category?: string | null): string {
  if (!category) {
    return '';
  }

  return CATEGORY_LABELS[category] ?? category;
}

export function getCategoryIconName(
  category?: string | null
): IconName | null {
  if (!category) {
    return null;
  }

  return CATEGORY_ICON_NAMES[category] ?? null;
}

export function getCategoryStripeTone(category?: string | null): string {
  if (!category) {
    return DEFAULT_STRIPE_TONE;
  }

  return CATEGORY_STRIPE_TONES[category] ?? DEFAULT_STRIPE_TONE;
}

type CategoryIconProps = {
  category?: string | null;
} & Omit<SVGProps<SVGSVGElement>, 'name'>;

export function CategoryIcon({
  category,
  ...iconProps
}: CategoryIconProps): React.ReactElement | null {
  const name = getCategoryIconName(category);
  if (!name) {
    return null;
  }
  return <Icon name={name} {...iconProps} />;
}
