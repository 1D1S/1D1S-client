// 챌린지 상세 탭 뷰 정의 — URL ?tab= 으로 보존. 기본은 소개(overview).
// ChallengeDetailScreen 에서 분리한 순수 상수/타입/가드(동작 불변).
export const CHALLENGE_TAB_IDS = [
  'overview',
  'stats',
  'diary',
  'participants',
] as const;

export type ChallengeTabId = (typeof CHALLENGE_TAB_IDS)[number];

export function isChallengeTab(value: string | null): value is ChallengeTabId {
  const ids: readonly string[] = CHALLENGE_TAB_IDS;
  return value !== null && ids.includes(value);
}
