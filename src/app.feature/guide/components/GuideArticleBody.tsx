import { cn } from '@module/utils/cn';
import Link from 'next/link';
import React from 'react';

import {
  GUIDE_ARTICLES,
  type GuideArticle,
  type GuideBlock,
} from '../consts/guideArticles';
import { GuideCtaLink } from './GuideCtaLink';

/**
 * 주제별 가이드 본문 렌더러.
 *
 * 서버 컴포넌트다 — 본문 전체가 초기 HTML 에 실려야 크롤러와 AI 답변엔진이
 * 읽는다. 그래서 design-system(Text 등)을 쓰지 않고 동등한 Tailwind 클래스로
 * 그린다(이 패키지를 RSC 에서 import 하면 빌드가 깨진다).
 */

const PROSE = 'text-[15.5px] leading-[1.85] break-keep text-gray-700';

function Block({ block }: { block: GuideBlock }): React.ReactElement {
  if (block.type === 'p') {
    return <p className={cn('mt-4', PROSE)}>{block.text}</p>;
  }

  if (block.type === 'list') {
    const ListTag = block.ordered ? 'ol' : 'ul';
    return (
      <ListTag
        className={cn(
          'mt-4 flex flex-col gap-2 pl-5',
          block.ordered ? 'list-decimal' : 'list-disc',
          PROSE
        )}
      >
        {block.items.map((item) => (
          <li key={item} className="pl-1">
            {item}
          </li>
        ))}
      </ListTag>
    );
  }

  if (block.type === 'note') {
    return (
      <aside
        className={cn(
          'border-main-800 bg-main-200 mt-5 rounded-r-[10px]',
          'border-l-[3px] px-4 py-3.5',
          'text-[15px] leading-[1.8] break-keep text-gray-700'
        )}
      >
        {block.text}
      </aside>
    );
  }

  if (block.type === 'table') {
    return (
      // 표는 좁은 화면에서 가로로만 스크롤시킨다 — 페이지 자체가 가로로
      // 밀리면 모바일에서 읽을 수 없다.
      <div className="-mx-5 mt-5 overflow-x-auto px-5 lg:mx-0 lg:px-0">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-300">
              {block.head.map((cell) => (
                <th
                  key={cell}
                  scope="col"
                  className="py-2.5 pr-4 text-[14px] font-bold text-gray-900"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.join('|')} className="border-b border-gray-100">
                {row.map((cell) => (
                  <td
                    key={cell}
                    className={cn(
                      'py-3 pr-4 align-top text-[14.5px]',
                      'leading-[1.7] break-keep text-gray-600'
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <ul className="mt-5 flex flex-col gap-2.5">
      {block.items.map((item) => (
        <li
          key={item.href}
          className="rounded-[12px] border border-gray-200 px-4 py-3.5"
        >
          <Link
            href={item.href}
            className="text-main-800 text-[15.5px] font-bold hover:underline"
          >
            {item.label}
          </Link>
          <p className="mt-1 text-[14.5px] leading-[1.7] break-keep text-gray-500">
            {item.note}
          </p>
        </li>
      ))}
    </ul>
  );
}

function RelatedArticles({ slugs }: { slugs: string[] }): React.ReactElement {
  const articles = slugs
    .map((slug) => GUIDE_ARTICLES.find((item) => item.slug === slug))
    .filter((item): item is GuideArticle => Boolean(item));

  return (
    <nav aria-labelledby="related-guides" className="mt-14">
      <h2
        id="related-guides"
        className="text-xl font-extrabold break-keep text-gray-900"
      >
        함께 읽으면 좋은 글
      </h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/guide/${article.slug}`}
              className={cn(
                'block rounded-[12px] border border-gray-200 px-4 py-3.5',
                'transition hover:border-gray-300'
              )}
            >
              <span className="block text-[15.5px] font-bold text-gray-900">
                {article.title}
              </span>
              <span className="mt-1 block text-[14.5px] text-gray-500">
                {article.cardText}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function GuideArticleBody({
  article,
}: {
  article: GuideArticle;
}): React.ReactElement {
  return (
    <article className="mx-auto w-full max-w-[760px] px-5 py-8 lg:py-14">
      <nav aria-label="위치" className="text-[13.5px] text-gray-400">
        <Link href="/guide" className="hover:underline">
          가이드
        </Link>
      </nav>

      <h1
        className={cn(
          'mt-2 text-[25px] leading-[1.32] font-extrabold break-keep',
          'text-gray-900 sm:text-[28px] lg:text-[34px]'
        )}
      >
        {article.title}
      </h1>

      {/* 메타는 한 줄 고정. "업데이트"·"약" 같은 군말을 빼고 날짜와 분량만
          남긴다. 구분점은 앞뒤로 공백을 하나씩 둬서(gap 으로) 두 항목이
          붙어 보이지 않게 한다. whitespace-nowrap 이라 좁은 폭에서도 줄이
          안 접힌다. */}
      <p
        className={cn(
          'mt-2.5 flex items-center gap-1.5',
          'text-[13px] whitespace-nowrap text-gray-400'
        )}
      >
        <time dateTime={article.updated}>
          {article.updated.replaceAll('-', '.')}
        </time>
        <span aria-hidden>·</span>
        <span>{article.readingMinutes}분 읽기</span>
      </p>

      <p
        className={cn(
          'mt-6 border-l-[3px] border-gray-200 pl-4',
          'text-[16px] leading-[1.85] break-keep text-gray-600'
        )}
      >
        {article.summary}
      </p>

      {article.sections.map((section) => (
        <section key={section.heading} className="mt-12">
          <h2 className="text-xl font-extrabold break-keep text-gray-900 lg:text-[23px]">
            {section.heading}
          </h2>
          {section.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </section>
      ))}

      {article.faq?.length ? (
        <section className="mt-14">
          <h2 className="text-xl font-extrabold break-keep text-gray-900 lg:text-[23px]">
            자주 묻는 질문
          </h2>
          <dl className="mt-4 flex flex-col gap-5">
            {article.faq.map(({ question, answer }) => (
              <div key={question}>
                <dt className="text-[16px] font-bold break-keep text-gray-900">
                  {question}
                </dt>
                <dd className={cn('mt-1.5', PROSE)}>{answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <RelatedArticles slugs={article.related} />

      <div
        className={cn('bg-main-200 mt-14 rounded-[16px] px-6 py-8 text-center')}
      >
        <p className="text-[17px] font-extrabold break-keep text-gray-900">
          읽었다면, 오늘 하나만 정해볼까요?
        </p>
        <p className="mt-2 text-[14.5px] leading-[1.7] break-keep text-gray-600">
          1D1S 에서 챌린지를 찾아 참여하거나 직접 만들고, 매일의 기록을 남길 수
          있습니다.
        </p>
        {/* 앱 웹뷰에서는 네이티브 화면으로 넘긴다(GuideCtaLink). 웹에서는
            평소대로 라우팅되고, 마크업에는 실제 href 가 남는다. */}
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <GuideCtaLink
            href="/challenge"
            className={cn(
              'bg-main-800 inline-flex items-center rounded-full',
              'px-6 py-3 text-[15px] font-extrabold text-white',
              'transition hover:brightness-95'
            )}
          >
            챌린지 둘러보기
          </GuideCtaLink>
          <GuideCtaLink
            href="/challenge/create"
            className={cn(
              'text-main-800 inline-flex items-center rounded-full',
              'border border-gray-200 bg-white px-6 py-3',
              'text-[15px] font-extrabold transition hover:brightness-95'
            )}
          >
            챌린지 만들기
          </GuideCtaLink>
        </div>
      </div>
    </article>
  );
}
