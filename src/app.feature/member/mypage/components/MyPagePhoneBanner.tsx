'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ChevronRight, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

/**
 * 전화번호 미입력 안내 배너. 누르면 프로필 설정(전화번호 입력 항목이 있는
 * 화면)으로 이동한다. 노출 조건(전화번호 없음)은 호출부에서 판단한다.
 */
export function MyPagePhoneBanner({
  className,
}: {
  className?: string;
}): React.ReactElement {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push('/mypage/settings/profile')}
      className={cn(
        'rounded-2 flex w-full items-center gap-3 border border-amber-200',
        'bg-amber-50 px-4 py-3 text-left transition hover:bg-amber-100',
        className
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          'bg-amber-100 text-amber-700'
        )}
      >
        <Phone className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <Text size="body1" weight="bold" className="block text-amber-900">
          전화번호를 추가해주세요!
        </Text>
        <Text size="caption1" weight="regular" className="block text-amber-700">
          상품 수령에 필요해요.
        </Text>
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-amber-600"
        aria-hidden
      />
    </button>
  );
}
