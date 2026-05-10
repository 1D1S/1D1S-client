import { type ChallengeCategory } from '@feature/challenge/board/type/challenge';

const CATEGORY_ACCENT: Record<ChallengeCategory, string> = {
  ALL: '#ff7043',
  EXERCISE: '#ff7043',
  DEV: '#7c3aed',
  BOOK: '#3eb489',
  MUSIC: '#1666ba',
  STUDY: '#a78bfa',
  LEISURE: '#ff9800',
  ECONOMY: '#3eb489',
};

const DEFAULT_ACCENT = '#ff7043';

function shade(hex: string, amount: number): string {
  const cleaned = hex.replace('#', '');
  const num = Number.parseInt(cleaned, 16);
  const clamp = (value: number): number =>
    Math.max(0, Math.min(255, value));
  const red = clamp(((num >> 16) & 0xff) + amount);
  const green = clamp(((num >> 8) & 0xff) + amount);
  const blue = clamp((num & 0xff) + amount);
  return `#${((red << 16) | (green << 8) | blue)
    .toString(16)
    .padStart(6, '0')}`;
}

export function getCategoryAccent(
  category?: ChallengeCategory | null
): string {
  if (!category) {
    return DEFAULT_ACCENT;
  }
  return CATEGORY_ACCENT[category] ?? DEFAULT_ACCENT;
}

export function buildHeroGradient(accent: string): string {
  return `linear-gradient(135deg, ${accent} 0%, ${shade(accent, -30)} 100%)`;
}
