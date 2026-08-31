import { cn } from '@module/utils/cn';
import Link from 'next/link';
import React from 'react';

import { GUIDE_ARTICLES } from '../consts/guideArticles';

/**
 * /guide 하단의 주제별 가이드 글 목록.
 *
 * GuideScreen(클라이언트·design-system)을 건드리지 않고 서버 컴포넌트로
 * 덧붙인다 — 링크가 초기 HTML 에 있어야 크롤러가 글들을 타고 들어간다.
 */
export function GuideArticleList(): React.ReactElement {
  return (
    <section
      aria-labelledby="guide-articles"
      className="mx-auto w-full max-w-[900px] px-5 pb-16 lg:px-8"
    >
      <h2
        id="guide-articles"
        className="text-2xl font-extrabold break-keep text-gray-900"
      >
        주제별 가이드
      </h2>
      <p className="mt-2 text-[15px] leading-[1.7] break-keep text-gray-500">
        습관·스트릭·독서·루틴에 대해 자주 묻는 것들을 정리했습니다.
      </p>
      <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {GUIDE_ARTICLES.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/guide/${article.slug}`}
              className={cn(
                'flex h-full flex-col gap-1.5 rounded-[14px]',
                'border border-gray-200 px-5 py-4',
                'transition hover:border-gray-300'
              )}
            >
              <h3 className="text-[16px] font-bold break-keep text-gray-900">
                {article.title}
              </h3>
              <p className="text-[14.5px] leading-[1.65] break-keep text-gray-500">
                {article.cardText}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
