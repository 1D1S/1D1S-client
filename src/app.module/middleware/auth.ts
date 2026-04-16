import { NextResponse } from 'next/server';

/**
 * 인증 미들웨어
 * - 상세 페이지(챌린지/일지)는 비로그인 사용자도 열람 가능
 * - 로그인이 필요한 액션(좋아요, 댓글 등)은 클라이언트에서 개별 처리
 *
 * @returns NextResponse | null
 */
export function authMiddleware(): NextResponse | null {
  return null;
}
