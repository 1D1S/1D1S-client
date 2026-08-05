'use client';

import React, { useEffect } from 'react';

/**
 * 루트 레이아웃까지 무너졌을 때의 최후 방어선. 이 바운더리는 <html> 을 직접
 * 그려야 하므로 디자인시스템/전역 CSS 에 의존하지 않는다(그것들이 원인일 수
 * 있다). 인라인 스타일만 쓴다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset(): void;
}): React.ReactElement {
  useEffect(() => {
    console.error('[global-error-boundary]', error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: '#fff',
          fontFamily:
            'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
          textAlign: 'center',
          padding: 32,
        }}
      >
        <p style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>
          일시적인 오류가 발생했습니다
        </p>
        <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>
          잠시 후 다시 시도해 주세요.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={() => window.location.replace('/')}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: '#111827',
              color: '#fff',
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            홈으로 이동
          </button>
        </div>
      </body>
    </html>
  );
}
