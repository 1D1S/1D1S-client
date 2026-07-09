import type { ChallengeDetailResponse } from '@feature/challenge/board/type/challenge';

// 인증샷(사진) 필수 관련 상수/헬퍼를 한 곳에 모은다. 백엔드 최종 필드명이나
// 에러 코드가 확정되면 이 파일(+ challenge.ts 타입)만 수정하면 된다.

// 사진 필수 위반 시 백엔드가 내려주는 도메인 에러 코드(가정값).
export const PHOTO_REQUIRED_ERROR_CODE = 'DIARY-010';

// 프론트 선제 차단 및 백엔드 위반 응답을 받았을 때 공통으로 쓰는 안내 문구.
export const PHOTO_REQUIRED_MESSAGE =
  '이 챌린지는 인증샷(사진)을 1장 이상 첨부해야 해요.';

// 챌린지 상세 응답에서 인증샷 필수 여부를 읽는다. 응답 내 위치/필드명이
// 바뀌면 이 함수만 고치면 된다.
export function isChallengePhotoRequired(
  detail: ChallengeDetailResponse | undefined
): boolean {
  return detail?.challengeDetail?.photoRequired === true;
}
