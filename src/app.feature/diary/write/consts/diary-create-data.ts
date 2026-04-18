import type { Feeling } from '../../board/type/diary';

export interface MoodOption {
  id: Feeling;
  imageSrc: string;
  alt: string;
  label: string;
}

export const DIARY_CREATE_MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'SAD',
    imageSrc: '/images/mood-sad.PNG',
    alt: '힘든 얼굴',
    label: '힘듦',
  },
  {
    id: 'NORMAL',
    imageSrc: '/images/mood-soso.PNG',
    alt: '무표정 얼굴',
    label: '보통',
  },
  {
    id: 'HAPPY',
    imageSrc: '/images/mood-happy.PNG',
    alt: '행복한 얼굴',
    label: '좋음',
  },
];
