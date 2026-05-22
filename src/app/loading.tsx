import React from 'react';

// 라우트별 loading.tsx 가 없는 경로에서도 즉시 시각적 피드백을 주기 위한
// 최상위 로딩 fallback. 빈 화면 대신 얇은 진행바를 보여줘 탭 클릭이
// 인식되었음을 알린다.
export default function RootLoading(): React.ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="페이지를 불러오는 중"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div className="bg-brand h-full w-full animate-pulse" />
    </div>
  );
}
