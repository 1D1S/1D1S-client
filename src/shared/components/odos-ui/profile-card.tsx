'use client';

import Image from 'next/image';
import React from 'react';
import { OdosLabel } from './label';
import { OdosButton } from './button';
import { cn } from '@/shared/lib/utils';
import { useRouter } from 'next/navigation';

type Mode = 'collapsed' | 'expanding' | 'expanded' | 'collapsing';

export function OdosProfileCard({
  initialMode = 'collapsed',
}: {
  initialMode?: Mode;
}): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = false;
  const [mode, setMode] = React.useState<Mode>(initialMode);

  const isExpanded = mode === 'expanded' || mode === 'expanding';
  const shouldRenderContent = mode === 'expanded' || mode === 'collapsing'; // ❗️expanding 상태 제외

  const handleToggle = (): void => {
    if (mode === 'collapsed') {
      setMode('expanding');
      setTimeout(() => setMode('expanded'), 300);
    } else if (mode === 'expanded') {
      setMode('collapsing');
      setTimeout(() => setMode('collapsed'), 200);
    }
  };

  const handleGoLogin = (): void => {
    router.push('/auth/login');
  };

  const handleGoDiary = (): void => {
    router.push('/diary/create');
  };

  return (
    <div
      className={cn(
        'rounded-odos-2 shadow-odos-default relative flex flex-col bg-white transition-all duration-300 ease-in-out',
        mode === 'collapsed' ? 'h-20 w-20 justify-center p-4' : 'w-100 p-6'
      )}
      onClick={isExpanded !== true ? handleToggle : undefined}
    >
      {/* 항상 보이는 프로필 이미지 */}
      <div className="flex w-full">
        <Image
          src="/images/default-profile.png"
          alt="profile-image"
          className="rounded-full object-cover"
          width={50}
          height={50}
        />

        {/* 텍스트 콘텐츠 */}
        {shouldRenderContent && (
          <div
            className={cn(
              'ml-4 flex flex-col justify-between',
              mode === 'expanded' && 'fade-in',
              mode === 'collapsing' && 'fade-out'
            )}
          >
            <OdosLabel size="body1" weight="medium">
              로그인이 필요해요.
            </OdosLabel>
            <OdosLabel size="caption2" weight="regular">
              오늘의 목표 ?개
            </OdosLabel>
          </div>
        )}
      </div>

      {shouldRenderContent && (
        <div
          className={cn(
            'mt-6 flex w-full items-center justify-center',
            mode === 'expanded' && 'fade-in',
            mode === 'collapsing' && 'fade-out'
          )}
        >
          <OdosLabel size="heading2" weight="bold" className="text-main-900">
            ??
          </OdosLabel>
          <OdosLabel size="heading2" weight="bold">
            일 연속 수행
          </OdosLabel>
        </div>
      )}

      {shouldRenderContent && (
        <div
          className={cn(
            'mt-6',
            mode === 'expanded' && 'fade-in',
            mode === 'collapsing' && 'fade-out'
          )}
        >
          <OdosButton className="w-full" onClick={isLoggedIn ? handleGoDiary : handleGoLogin}>
            {isLoggedIn ? '일지 쓰러 가기 →' : '로그인 하러 가기 →'}
          </OdosButton>
        </div>
      )}

      {/* 왼쪽 하단 꺽쇠 버튼 */}
      <button
        onClick={handleToggle}
        disabled={initialMode === 'expanded'}
        hidden={initialMode === 'expanded'}
        className="absolute bottom-2 left-2 text-gray-400 transition-transform duration-300 hover:text-black"
      >
        <Image
          src="/images/angle-bracket.png"
          alt="angle-bracket"
          width={12}
          height={12}
          className={cn('transition-transform duration-300', isExpanded && 'rotate-180')}
        />
      </button>
    </div>
  );
}
