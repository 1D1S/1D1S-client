import { getCategoryStripeTone } from '@constants/categories';
import { type ChallengeCategory } from '@feature/challenge/board/type/challenge';

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
  return getCategoryStripeTone(category);
}

export function buildHeroGradient(accent: string): string {
  return `linear-gradient(135deg, ${accent} 0%, ${shade(accent, -30)} 100%)`;
}
