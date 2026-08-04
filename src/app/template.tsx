import React from 'react';

/**
 * 라우트 전환 애니메이션. template 은 내비게이션마다 리마운트되므로 진입
 * 애니메이션이 매 전환에 1회 실행된다 — 하드 컷으로 화면이 갈리던 것이
 * 짧은 페이드로 이어져 "웹 페이지" 티가 크게 줄어든다.
 *
 * opacity 만 쓴다. transform 을 걸면 애니메이션 동안 이 div 가 fixed
 * 자손(하단 액션바, 고정 헤더)의 containing block 이 되어 그 150ms 동안
 * 위치가 틀어진다.
 */
export default function Template({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <div className="animate-page-enter">{children}</div>;
}
