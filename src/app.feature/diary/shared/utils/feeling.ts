import { type Feeling } from '@feature/diary/board/type/diary';

export type DiaryEmotion = 'happy' | 'soso' | 'sad';

export function mapFeelingToEmotion(feeling: Feeling): DiaryEmotion {
  if (feeling === 'HAPPY') {
    return 'happy';
  }
  if (feeling === 'SAD') {
    return 'sad';
  }
  return 'soso';
}

export interface EmotionTone {
  /** 텍스트 색(달성률·기분 텍스트) — Tailwind class. */
  fg: string;
  /** 체크 원 배경(카드가 직접 렌더) — Tailwind class. */
  check: string;
  /** DS CheckList 의 checkColor(상세 목표 리스트) — CSS color. */
  checkColor: string;
}

// 감정별 무드 컬러 — 카드·상세가 공유하는 단일 소스. 무드 SVG 얼굴색 팔레트
// (happy=main/피치·soso=mint·sad=blue)를 따르되 흰 체크·텍스트 대비를 위해 한
// 단계 진한 톤을 쓴다. Tailwind class 는 카드가 직접 렌더하는 요소용, checkColor
// 는 DS CheckList(상세)용 — JIT 가 동적 클래스를 못 만들어 두 형태를 함께 둔다.
export const EMOTION_TONE: Record<DiaryEmotion, EmotionTone> = {
  happy: {
    fg: 'text-main-700',
    check: 'bg-main-700',
    checkColor: 'var(--color-main-700)',
  },
  soso: {
    fg: 'text-mint-900',
    check: 'bg-mint-800',
    checkColor: 'var(--color-mint-800)',
  },
  sad: {
    fg: 'text-blue-600',
    check: 'bg-blue-500',
    checkColor: 'var(--color-blue-500)',
  },
};

/** 상세의 Feeling 값에서 바로 무드 톤을 얻는다(카드와 동일 매핑·색). */
export function toneFromFeeling(feeling: Feeling): EmotionTone {
  return EMOTION_TONE[mapFeelingToEmotion(feeling)];
}
