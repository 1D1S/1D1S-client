'use client';

import { cn } from '@module/utils/cn';
import React from 'react';

import { CHAT_URL_PATTERN, trimUrlTail } from '../utils/chatShareLink';

interface ChatLinkifiedTextProps {
  value: string;
  /** 내 말풍선은 주황 바탕이라 흰 글씨에 밑줄, 상대는 브랜드 링크색. */
  isMine: boolean;
}

/** 본문 안의 URL 을 눌러 열 수 있게 자른다. 링크가 없으면 글 그대로. */
export function ChatLinkifiedText({
  value,
  isMine,
}: ChatLinkifiedTextProps): React.ReactNode {
  const matches = Array.from(value.matchAll(CHAT_URL_PATTERN));
  if (matches.length === 0) {
    return value;
  }

  const linkClass = cn(
    'break-all underline underline-offset-2',
    isMine ? 'text-white decoration-white/70' : 'text-main-700'
  );
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach((match, index) => {
    const [raw] = match;
    const start = match.index ?? 0;
    if (start > cursor) {
      nodes.push(value.slice(cursor, start));
    }
    const url = trimUrlTail(raw);
    nodes.push(
      <a
        key={`${url}-${index}`}
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className={linkClass}
        onClick={(event) => event.stopPropagation()}
      >
        {url}
      </a>
    );
    // 잘라 낸 꼬리는 일반 글자로 되돌린다.
    if (url.length < raw.length) {
      nodes.push(raw.slice(url.length));
    }
    cursor = start + raw.length;
  });
  if (cursor < value.length) {
    nodes.push(value.slice(cursor));
  }
  return nodes;
}
