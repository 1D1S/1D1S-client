'use client';

import { MobileHeader, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

interface LegalPageShellProps {
  title: string;
  description?: string;
  effectiveDate: string;
  sections: LegalSection[];
  footer?: string;
}

/**
 * 이용약관/개인정보 처리방침 등 정적 정책 페이지 공통 레이아웃.
 * - 모바일: sticky 백 헤더 + 타이틀
 * - 데스크탑: 큰 페이지 타이틀 + 시행일
 */
export function LegalPageShell({
  title,
  description,
  effectiveDate,
  sections,
  footer,
}: LegalPageShellProps): React.ReactElement {
  const router = useRouter();
  return (
    <div className="min-h-screen w-full bg-white">
      <MobileHeader title={title} onBack={() => router.back()} />

      <section
        className={cn(
          'mx-auto w-full max-w-[820px]',
          'px-5 py-5 lg:px-8 lg:py-10'
        )}
      >
        <header
          className={cn(
            'hidden flex-col gap-2 border-b border-gray-100 pb-6',
            'lg:flex'
          )}
        >
          <Text
            size="pageTitle"
            weight="extrabold"
            className="tracking-tight text-gray-900"
          >
            {title}
          </Text>
          {description ? (
            <Text size="body2" weight="regular" className="text-gray-500">
              {description}
            </Text>
          ) : null}
          <Text size="caption2" weight="regular" className="mt-1 text-gray-400">
            시행일: {effectiveDate}
          </Text>
        </header>

        <div className="lg:hidden">
          <Text size="caption2" weight="regular" className="text-gray-400">
            시행일: {effectiveDate}
          </Text>
        </div>

        <div className="mt-4 flex flex-col gap-7 lg:mt-8">
          {sections.map((section) => (
            <article key={section.heading} className="flex flex-col gap-2">
              <Text
                as="h2"
                size="heading2"
                weight="bold"
                className="text-gray-900"
              >
                {section.heading}
              </Text>
              <Text
                size="body2"
                weight="regular"
                className={cn('leading-7 whitespace-pre-line text-gray-700')}
              >
                {section.body}
              </Text>
            </article>
          ))}

          {footer ? (
            <Text
              size="caption1"
              weight="regular"
              className={cn('mt-2 leading-6 whitespace-pre-line text-gray-500')}
            >
              {footer}
            </Text>
          ) : null}

          {/* 이 페이지들은 상단 네비 없이 본문만 나오므로(AppLayoutShell 의
              BARE_CHROME_ROUTES) 문서 끝에 돌아갈 길을 둔다. */}
          <nav
            aria-label="서비스로 돌아가기"
            className={cn(
              'mt-10 flex flex-wrap items-center gap-2.5',
              'border-t border-gray-100 pt-8'
            )}
          >
            <Link
              href="/"
              className={cn(
                'bg-main-800 inline-flex items-center rounded-full',
                'px-6 py-3 text-[15px] font-extrabold text-white',
                'transition hover:brightness-95'
              )}
            >
              1D1S 홈으로
            </Link>
            <Link
              href="/challenge"
              className={cn(
                'text-main-800 inline-flex items-center rounded-full',
                'border border-gray-200 bg-white px-6 py-3',
                'text-[15px] font-extrabold transition hover:brightness-95'
              )}
            >
              챌린지 둘러보기
            </Link>
          </nav>
        </div>
      </section>
    </div>
  );
}
