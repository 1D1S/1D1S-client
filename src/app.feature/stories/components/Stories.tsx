'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React, { useState } from 'react';

import { useStories } from '../hooks/useStoryQueries';
import { sortStoryGroups } from '../utils/storyHelpers';
import { useIsDesktopViewport } from '../utils/useIsDesktopViewport';
import StoryRing from './StoryRing';
import StoryViewer from './StoryViewer';

interface StoriesProps {
  /** 로그인 여부 — 비로그인 시 호출 자체를 막는다. */
  enabled?: boolean;
}

function StoryRingSkeleton(): React.ReactElement {
  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full gap-3.5 overflow-x-auto',
        'px-5 py-3.5'
      )}
      aria-busy
      aria-label="스토리 불러오는 중"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-shrink-0 flex-col items-center gap-1.5"
        >
          <div
            className={cn(
              'h-[74px] w-[74px] rounded-full',
              'animate-pulse bg-gray-200'
            )}
          />
          <Text size="caption1" weight="medium" className="text-transparent">
            로딩
          </Text>
        </div>
      ))}
    </div>
  );
}

export default function Stories({
  enabled = true,
}: StoriesProps): React.ReactElement | null {
  const isDesktop = useIsDesktopViewport();
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const { data, isLoading, isError } = useStories({ enabled });

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return <StoryRingSkeleton />;
  }

  if (isError || !data) {
    return null;
  }

  const groups = sortStoryGroups(data.storyGroups);

  if (groups.length === 0) {
    return null;
  }

  return (
    <>
      <StoryRing groups={groups} onSelect={setOpenIndex} />
      {openIndex >= 0 ? (
        <StoryViewer
          groups={groups}
          startIndex={openIndex}
          mode={isDesktop ? 'dialog' : 'fullscreen'}
          onClose={() => setOpenIndex(-1)}
        />
      ) : null}
    </>
  );
}
