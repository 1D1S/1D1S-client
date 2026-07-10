'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

interface ChallengeDetailCompactHeaderProps {
  /** 스크롤 임계값 초과 시 true — 페이드인 노출 */
  visible: boolean;
  title: string;
  onBack(): void;
}

/**
 * 챌린지 상세 모바일 sliver-style sticky 헤더 — 스크롤 시 페이드인.
 *
 * data-fade-in 래퍼 밖에 둔다: 래퍼의 transform 이 containing block 을
 * 만들어 position: fixed 가 뷰포트 대신 래퍼 기준이 되는 문제를 피한다.
 * 네이티브 쉘에선 AppBackBar 가 같은 역할을 하므로 data-native-hide 로
 * 가린다. globals.css 의 sticky 일괄 룰은 fixed 는 안 잡는다.
 *
 * (PR A 의 MobileStickyHeader 와 달리 fixed + 스크롤 페이드인 동작이라
 * 별도 컴포넌트로 둔다.)
 */
export function ChallengeDetailCompactHeader({
  visible,
  title,
  onBack,
}: ChallengeDetailCompactHeaderProps): React.ReactElement {
  return (
    <div
      data-native-hide
      className={cn(
        'fixed top-0 right-0 left-0 z-30 flex h-14 items-center',
        'gap-3 border-b border-gray-100 bg-white/95 px-4',
        'backdrop-blur transition-all duration-200 lg:hidden',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-full opacity-0'
      )}
    >
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center',
          'rounded-lg text-gray-700 transition-colors hover:bg-gray-100'
        )}
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <Text
        size="body1"
        weight="extrabold"
        className={cn(
          'line-clamp-1 min-w-0 flex-1 tracking-[-0.3px] text-gray-900'
        )}
      >
        {title}
      </Text>
    </div>
  );
}
