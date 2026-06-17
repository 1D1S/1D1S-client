'use client';

import './highlight.css';

import { cn } from '@module/utils/cn';
import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const blocks =
      container.querySelectorAll<HTMLElement>('pre code');
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
        '[&>p]:my-2 [&>p:empty]:min-h-[1.5em]',
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
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
