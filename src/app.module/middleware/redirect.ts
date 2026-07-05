import { NextResponse } from 'next/server';

/**
 * 리디렉션 및 리라이트 처리 미들웨어.
 * 현재 정적 리디렉션 규칙이 없어 항상 null 을 반환한다.
 * 규칙이 생기면 req 인자를 받아 pathname 분기를 추가한다.
 *
 * @returns NextResponse | null
 */
// ponytail: 규칙 없을 땐 null 패스스루. 매핑 생기면 req 받아 분기 추가.
export function redirectMiddleware(): NextResponse | null {
  return null;
}
