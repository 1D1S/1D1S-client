import { GuideArticleList } from '@feature/guide/components/GuideArticleList';
import GuideScreen from '@feature/guide/screen/GuideScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '사용 가이드 | 1Day 1Streak',
  description:
    '챌린지 참여부터 일지 작성까지, 1Day 1Streak 사용법을 안내합니다.',
  path: '/guide',
  type: 'website',
});

export default function GuidePage(): React.ReactElement {
  return (
    <>
      <GuideScreen />
      {/* 주제별 가이드 글 목록. 서버 컴포넌트라 링크가 초기 HTML 에 실려
          크롤러가 글들을 발견한다(내부 링크 진입점). */}
      <GuideArticleList />
    </>
  );
}
