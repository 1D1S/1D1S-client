export interface GoalItem {
  id: number;
  label: string;
  done: boolean;
}

export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
}

export const DIARY_CREATE_INITIAL_GOALS: GoalItem[] = [
  { id: 1, label: '아침 7시에 기상하기', done: true },
  { id: 2, label: '물 2L 마시기', done: true },
  { id: 3, label: '하루 30분 독서', done: false },
];

export const DIARY_CREATE_MOOD_OPTIONS: MoodOption[] = [
  { id: 'hard', emoji: '😣', label: '힘듦' },
  { id: 'normal', emoji: '😐', label: '보통' },
  { id: 'good', emoji: '😁', label: '좋음' },
  { id: 'proud', emoji: '🔥', label: '뿌듯' },
  { id: 'best', emoji: '🥳', label: '최고' },
];

export const DIARY_CREATE_INITIAL_CONTENT =
  '오늘 챌린지를 진행하며 느낀 점이나 있었던 일을 자유롭게 기록해보세요.';
