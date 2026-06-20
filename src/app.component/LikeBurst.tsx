'use client';

import { cn } from '@module/utils/cn';
import React, { useState } from 'react';

export interface LikeBurstProps {
  // 부모의 "좋아요" 상태. false→true 전환에서만 버스트가 1회 발생한다.
  // 좋아요 취소(true→false)에서는 발생하지 않는다.
  liked: boolean;
  // 방출할 하트 파티클 개수.
  particleCount?: number;
  className?: string;
}

const DEFAULT_PARTICLE_COUNT = 6;

// 각 파티클의 방출 각도/거리/딜레이를 인덱스로부터 산출한다. 360도를
// 균등 분할하고 살짝 흩뜨려 자연스럽게 퍼지도록 한다. transform 값만
// CSS 변수로 넘겨 키프레임이 GPU 합성으로 처리하도록 한다.
function getParticleStyle(
  index: number,
  total: number
): React.CSSProperties {
  const baseAngle = (360 / total) * index;
  const jitter = index % 2 === 0 ? -8 : 8;
  const angle = baseAngle + jitter;
  const distance = 16 + (index % 3) * 4;
  const delay = (index % 3) * 18;
  return {
    // CSS 커스텀 프로퍼티는 string 으로 전달한다.
    ['--lb-angle' as string]: `${angle}deg`,
    ['--lb-dist' as string]: `${distance}px`,
    animationDelay: `${delay}ms`,
  };
}

function LikeBurst({
  liked,
  particleCount = DEFAULT_PARTICLE_COUNT,
  className,
}: LikeBurstProps): React.ReactElement | null {
  // 직전 렌더의 liked 값을 상태로 보관해 false→true 전환을 감지한다.
  const [prevLiked, setPrevLiked] = useState(liked);
  // key 를 증가시켜 CSS 애니메이션을 매 좋아요마다 재생한다.
  const [burstKey, setBurstKey] = useState(0);

  // 렌더 중 직전 prop 과 비교해 상태를 1회 조정하는 React 공식 패턴
  // (https://react.dev/reference/react/useState — storing previous render).
  // false→true 일 때만 burstKey 를 올려 버스트를 1회 재생한다.
  if (liked !== prevLiked) {
    setPrevLiked(liked);
    if (liked) {
      setBurstKey((key) => key + 1);
    }
  }

  // 아직 한 번도 좋아요가 발생하지 않았으면 DOM 을 만들지 않는다.
  // (무한 스크롤 카드가 idle 상태에서 파티클 노드를 추가하지 않도록.)
  if (burstKey === 0) {
    return null;
  }

  const particles = Array.from({ length: particleCount });

  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-10 flex items-center',
        'justify-center overflow-visible',
        className
      )}
    >
      {/* key 변경으로 매 좋아요마다 자식 span 들이 remount 되어
          CSS 애니메이션이 처음부터 다시 재생된다. */}
      <span key={burstKey} className="relative block h-0 w-0">
        {particles.map((_, index) => (
          <span
            key={index}
            className="like-burst-particle"
            style={getParticleStyle(index, particleCount)}
          >
            ❤
          </span>
        ))}
      </span>
    </span>
  );
}

export default React.memo(LikeBurst);
