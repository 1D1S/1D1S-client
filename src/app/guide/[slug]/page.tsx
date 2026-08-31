import { GuideArticleBody } from '@feature/guide/components/GuideArticleBody';
import {
  findGuideArticle,
  GUIDE_ARTICLE_SLUGS,
} from '@feature/guide/consts/guideArticles';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  JsonLd,
} from '@module/metadata/jsonLd';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';

interface GuideArticlePageProps {
  params: Promise<{ slug: string }>;
}

// 글이 코드 안 상수라 빌드 시점에 전부 정적 생성한다(초기 HTML = 완성된 본문).
export function generateStaticParams(): Array<{ slug: string }> {
  return GUIDE_ARTICLE_SLUGS.map((slug) => ({ slug }));
}

// 목록에 없는 slug 는 404 로 확정한다 — 정적 생성분 외 임의 경로가
// 200 으로 열리면 색인에 빈 페이지가 쌓인다.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: GuideArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findGuideArticle(slug);
  if (!article) {
    return {};
  }

  return buildPageMetadata({
    title: article.metaTitle,
    description: article.description,
    path: `/guide/${article.slug}`,
  });
}

export default async function GuideArticlePage({
  params,
}: GuideArticlePageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const article = findGuideArticle(slug);
  if (!article) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildArticleJsonLd(article)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: '가이드', path: '/guide' },
          { name: article.title, path: `/guide/${article.slug}` },
        ])}
      />
      {article.faq?.length ? (
        <JsonLd data={buildFaqJsonLd(article.faq)} />
      ) : null}
      <GuideArticleBody article={article} />
    </>
  );
}
