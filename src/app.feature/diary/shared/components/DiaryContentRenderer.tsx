'use client';

import './highlight.css';

import { cn } from '@module/utils/cn';
import DOMPurify from 'dompurify';
import React, { useEffect, useMemo, useRef } from 'react';

// highlight.js github 테마는 일지 본문이 렌더될 때만 필요하므로 글로벌이 아닌
// 컴포넌트 레벨에서 import 한다.

interface DiaryContentRendererProps {
  html: string;
  className?: string;
}

export function DiaryContentRenderer({
  html,
  className,
}: DiaryContentRendererProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 백엔드 응답 HTML을 그대로 innerHTML 로 주입하므로, 저장형 XSS 를
  // 막기 위해 클라이언트에서 한 번 더 sanitize 한다. DOMPurify 는
  // window(DOM)가 필요하므로 SSR 단계에서는 빈 문자열을 렌더하고,
  // 본문은 클라이언트 쿼리로 도착하므로 하이드레이션 후 채워진다.
  const safeHtml = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return DOMPurify.sanitize(html);
  }, [html]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const blocks = container.querySelectorAll<HTMLElement>('pre code');
    if (blocks.length === 0) {
      return;
    }

    let cancelled = false;
    void import('highlight.js/lib/common').then((mod) => {
      if (cancelled) {
        return;
      }
      const hljs = mod.default;
      blocks.forEach((block) => {
        // hljs marks an element with `data-highlighted="yes"` after
        // running. Reset the flag so re-renders re-highlight content.
        delete block.dataset.highlighted;
        hljs.highlightElement(block);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'prose prose-sm max-w-none text-gray-700',
        // typography 플러그인이 없어 prose 가 무효 → <p> 마진이 0이 되어
        // 문단 줄바꿈이 사라진다. 문단 간격과 빈 줄을 직접 복원한다.
        //
        // 값은 앱과 못으로 박아 맞춘다(15px / 1.5 = 22.5px / 문단 사이 6px).
        // 같은 글이 앱과 웹에서 다른 리듬으로 보이면 어느 쪽이 맞는지
        // 사용자가 판단할 수 없다.
        'text-[15px] leading-[1.5]',
        // 마진은 문단 **사이**에만. my- 로 위아래 다 주면 본문 첫 줄이
        // 위 요소에서 떠 제목·사진과의 간격이 화면마다 달라진다.
        '[&>p]:my-0 [&>p+p]:mt-[6px]',
        // ★ 빈 줄은 두 모양이 온다. 웹 에디터(tiptap)는 `<p></p>` 를,
        // 앱은 `<p><br></p>` 를 낸다. 둘을 다르게 그리면 같은 글이 앱↔웹
        // 왕복 때마다 빈 줄이 조금씩 부푼다. `<p><br></p>` 는 br 이 만드는
        // 줄 상자로 이미 정확히 한 줄(1.5em)이므로, 빈 문단도 같은 높이를
        // 줘서 **두 모양이 픽셀 단위로 같아지게** 한다.
        '[&>p:empty]:h-[1.5em]',
        '[&_img]:max-h-80 [&_img]:rounded-lg',
        '[&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_ul]:list-disc [&_ul]:pl-5',
        '[&_pre]:rounded-lg [&_pre]:border [&_pre]:border-gray-200',
        '[&_pre]:bg-gray-50 [&_pre]:p-4 [&_pre]:text-gray-800',
        // 긴 코드 줄이 가로로 넘치지 않고 줄바꿈되도록 강제한다.
        // (hljs github 테마의 overflow-x:auto 보다 우선해 줄바꿈으로 처리)
        '[&_pre]:break-words [&_pre]:whitespace-pre-wrap',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_pre_code]:break-words [&_pre_code]:whitespace-pre-wrap',
        '[&_pre_code]:text-[0.875rem]',
        '[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-gray-100',
        '[&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5',
        '[&_:not(pre)>code]:text-[0.875rem]',
        className
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
