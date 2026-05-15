/**
 * 친구 기능 도메인 타입.
 *
 * 백엔드 OpenAPI 스키마에 응답 본문 정의가 비어 있어, 기존 회원/일지 API의
 * camelCase 컨벤션을 따라 추정한 형태로 작성했다. 실제 응답이 다르면 이
 * 파일과 `friendApi.ts`의 매핑만 조정하면 된다.
 */

/** 회원 간 관계 상태 (GET /friends/relation/{memberId}) */
export type FriendRelationStatus =
  | 'NONE'
  | 'SELF'
  | 'FRIEND'
  | 'REQUEST_SENT'
  | 'REQUEST_RECEIVED'
  | 'BLOCKED'
  | 'BLOCKED_BY';

export interface FriendRelation {
  memberId: number;
  status: FriendRelationStatus;
  /** REQUEST_SENT / REQUEST_RECEIVED 일 때 요청 식별자 */
  requestId?: number;
}

/** 친구 목록 / 차단 목록 아이템 */
export interface FriendSummary {
  memberId: number;
  nickname: string;
  profileUrl: string;
}

/** 친구 신청 목록 아이템 (보낸/받은 공통) */
export interface FriendRequestSummary {
  requestId: number;
  memberId: number;
  nickname: string;
  profileUrl: string;
  createdAt?: string;
}
