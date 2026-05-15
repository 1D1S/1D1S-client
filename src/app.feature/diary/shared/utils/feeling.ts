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
