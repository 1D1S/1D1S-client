import { Text } from '@1d1s/design-system';
import { MobileHeader } from '@component/layout/MobileHeader';
import { cn } from '@module/utils/cn';
import React from 'react';

interface LegalSection {
  heading: string;
  body: string;
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
  return (
    <div className="min-h-screen w-full bg-white">
      <MobileHeader title={title} />

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
        </div>
      </section>
    </div>
  );
}
