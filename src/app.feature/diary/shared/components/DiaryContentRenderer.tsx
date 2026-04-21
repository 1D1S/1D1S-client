'use client';

import { cn } from '@module/utils/cn';
import hljs from 'highlight.js/lib/common';
import React, { useEffect, useRef } from 'react';

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

    const blocks = container.querySelectorAll<HTMLElement>('pre code');
    blocks.forEach((block) => {
      // hljs marks an element with `data-highlighted="yes"` after running.
      // Reset the flag so re-renders re-highlight the new content.
      delete block.dataset.highlighted;
      hljs.highlightElement(block);
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'prose prose-sm max-w-none text-gray-700',
        '[&_img]:max-h-80 [&_img]:rounded-lg',
        '[&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_ul]:list-disc [&_ul]:pl-5',
        '[&_pre]:rounded-lg [&_pre]:border [&_pre]:border-gray-200',
        '[&_pre]:bg-gray-50 [&_pre]:p-4 [&_pre]:text-gray-800',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_pre_code]:text-[0.875rem]',
        '[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-gray-100',
        '[&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5',
        '[&_:not(pre)>code]:text-[0.875rem]',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
