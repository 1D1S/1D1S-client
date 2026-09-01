'use client';

import { requestNativePushRoute } from '@module/utils/nativeBridge';
import Link from 'next/link';
import React, { useCallback } from 'react';

interface GuideCtaLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * 가이드 글 하단 CTA 링크.
 *
 * 앱 웹뷰에서는 웹 라우팅 대신 네이티브 화면으로 넘긴다. 검색으로 가이드
 * 글에 들어온 앱 사용자가 "챌린지 둘러보기"를 눌렀을 때 웹뷰 안에 갇히지
 * 않고 앱의 챌린지 탭으로 가야 한다.
 *
 * `requestNativePushRoute` 는 네이티브 채널이 없거나 앱이 pushRoute 를
 * 지원하지 않으면 false 를 돌려준다. 그때는 평소대로 웹 라우팅한다
 * (참여자 프로필 이동 등 기존 사용처와 같은 패턴).
 *
 * `<Link href>` 를 그대로 두는 것이 중요하다 — onClick 을 가로채더라도
 * 마크업에는 실제 `<a href>` 가 남아야 크롤러가 내부 링크로 따라간다.
 */
export function GuideCtaLink({
  href,
  className,
  children,
}: GuideCtaLinkProps): React.ReactElement {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>): void => {
      // 새 탭·다운로드 등 브라우저 기본 동작은 건드리지 않는다.
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.button !== 0
      ) {
        return;
      }
      // 네이티브가 받아 가면 웹 이동을 막는다. 못 받으면 preventDefault 를
      // 하지 않으므로 Link 기본 동작(웹 라우팅)이 그대로 진행된다.
      if (requestNativePushRoute(href)) {
        event.preventDefault();
      }
    },
    [href]
  );

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
