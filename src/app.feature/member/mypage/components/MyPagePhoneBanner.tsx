'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ChevronRight, Phone } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

/**
 * 전화번호 미입력 안내 배너. 누르면 프로필 설정(전화번호 입력 항목이 있는
 * 화면)으로 이동한다. 노출 조건(전화번호 없음)은 호출부에서 판단한다.
 *
 * ⚠️ button + router.push 가 아니라 Link 여야 한다. 네이티브 앱의 클릭
 * 가로채기는 `a[href]` 만 잡아 클릭 시점에 상세 화면을 띄운다. 버튼이면 그
 * 경로를 타지 못해, 탭 웹뷰가 먼저 이동을 끝낸 뒤 앱이 URL 변경을 보고
 * 뒤늦게 상세를 띄우고 그 상세가 같은 페이지를 **다시** 불러온다 — 같은
 * 화면을 두 번 가져오는 만큼 느려진다.
 */
export function MyPagePhoneBanner({
  className,
}: {
  className?: string;
}): React.ReactElement {
  return (
    <Link
      href="/mypage/settings/profile"
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
    </Link>
  );
}
