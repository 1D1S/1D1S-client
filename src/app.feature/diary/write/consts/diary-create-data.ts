import type { Feeling } from '../../board/type/diary';

export interface MoodOption {
  id: Feeling;
  emoji: string;
  label: string;
}

export const DIARY_CREATE_MOOD_OPTIONS: MoodOption[] = [
  { id: 'SAD', emoji: '🥲', label: '힘듦' },
  { id: 'NORMAL', emoji: '🙂', label: '보통' },
  { id: 'HAPPY', emoji: '😎', label: '좋음' },
];
