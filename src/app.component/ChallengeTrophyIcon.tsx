import React from 'react';

// lucide 는 24 박스 기준 strokeWidth 를 받으므로, 이 아이콘의 좌표계
// (약 48~58 박스)에 맞게 환산한다. 기본값은 lucide 기본(2)에 근접.
const STROKE_SCALE = 2.4;
const DEFAULT_STROKE_WIDTH = 1.875; // * 2.4 = 4.5

/**
 * 챌린지 트로피 아이콘 — EmptyState의 챌린지 일러스트(별 박힌 트로피)에서
 * 배경 원을 제외한 형태를 추출했다. 색은 currentColor 를 따라 네비 활성/
 * 비활성 상태색을 그대로 상속하고, size/strokeWidth 는 lucide 아이콘과
 * 나란히 쓸 수 있도록 같은 의미(24 박스 기준)로 받는다.
 */
export function ChallengeTrophyIcon({
  className,
  size,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: {
  className?: string;
  size?: number | string;
  strokeWidth?: number | string;
}): React.ReactElement {
  const scaledStroke = Number(strokeWidth) * STROKE_SCALE;

  return (
    <svg
      viewBox="24 24 48 58"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M30 30h36v12a18 18 0 0 1-36 0z"
        stroke="currentColor"
        strokeWidth={scaledStroke}
        strokeLinejoin="round"
      />
      <path
        d="M44 60h8v8h-8z"
        stroke="currentColor"
        strokeWidth={scaledStroke}
      />
      <path
        d="M36 76h24"
        stroke="currentColor"
        strokeWidth={scaledStroke}
        strokeLinecap="round"
      />
      <path
        d="M48 38l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7
           1-5.8-4.2-4.1 5.8-.8z"
        fill="currentColor"
      />
    </svg>
  );
}
