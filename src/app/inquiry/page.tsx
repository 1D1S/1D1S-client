import {
  INQUIRY_ABOUT_ITEMS,
  INQUIRY_FAQ_ITEMS,
} from '@constants/consts/inquiryData';
import { InquiryScreen } from '@feature/inquiry/screen/InquiryScreen';
import { buildFaqJsonLd, JsonLd } from '@module/metadata/jsonLd';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '문의하기 | 1Day 1Streak',
  description: '1Day 1Streak 이용 중 궁금한 점을 문의해 주세요.',
  path: '/inquiry',
  type: 'website',
});

export default function InquiryPage(): React.ReactElement {
  return (
    <>
      {/* 화면에 실제로 렌더되는 FAQ 와 같은 상수를 쓴다 — 구조화 데이터에만
          있는 답변은 스팸으로 취급된다. */}
      <JsonLd
        data={buildFaqJsonLd([...INQUIRY_FAQ_ITEMS, ...INQUIRY_ABOUT_ITEMS])}
      />
      <InquiryScreen />
    </>
  );
}
