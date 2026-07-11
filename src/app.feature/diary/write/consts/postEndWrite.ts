// 종료 후 일지 작성 유예가 지났을 때 백엔드가 내려주는 도메인 에러 코드.
export const POST_END_WRITE_EXPIRED_ERROR_CODE = 'DIARY-011';

// 프론트는 버튼으로 이미 막지만, 위반 응답을 받았을 때 공통으로 쓰는 안내 문구.
export const POST_END_WRITE_EXPIRED_MESSAGE =
  '챌린지 종료 후 일지 작성 가능 기간이 지났습니다.';
