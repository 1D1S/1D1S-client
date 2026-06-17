'use client';

import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

/**
 * 정책 페이지(이용약관/개인정보) 모바일 sticky 헤더의 뒤로가기 버튼.
 * LegalPageShell 을 RSC 로 유지하기 위해, 유일한 인터랙션인 이 버튼만
 * 분리한 client leaf 컴포넌트다.
 */
export function LegalBackButton(): React.ReactElement {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="뒤로가기"
      onClick={() => router.back()}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg',
        'text-gray-700 transition-colors hover:bg-gray-100'
      )}
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
