import type { Feeling } from '../../board/type/diary';

export interface MoodOption {
  id: Feeling;
  imageSrc: string;
  alt: string;
  label: string;
  /** 선택 시 테두리·배경·라벨에 쓰는 무드 색 (얼굴 SVG 색과 맞춤) */
  tone: string;
}

export const DIARY_CREATE_MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'SAD',
    imageSrc: '/images/mood-sad.svg',
    alt: '힘든 얼굴',
    label: '힘듦',
    tone: '#368ce7',
  },
  {
    id: 'NORMAL',
    imageSrc: '/images/mood-soso.svg',
    alt: '무표정 얼굴',
    label: '보통',
    tone: '#3eb489',
  },
  {
    id: 'HAPPY',
    imageSrc: '/images/mood-happy.svg',
    alt: '행복한 얼굴',
    label: '좋음',
    tone: '#ff7b7b',
  },
];
