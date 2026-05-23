'use client';

import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useStories } from '../hooks/useStoryQueries';
import { sortStoryGroups } from '../utils/storyHelpers';
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
        'scrollbar-hide flex w-full gap-3 overflow-x-auto px-5 py-3.5'
      )}
      aria-busy
      aria-label="스토리 불러오는 중"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex w-[140px] flex-shrink-0 flex-col gap-2"
        >
          <div
            className={cn(
              'rounded-3 aspect-4/5 w-full animate-pulse bg-gray-200'
            )}
          />
          <div className="flex flex-col gap-1 px-0.5">
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Stories({
  enabled = true,
}: StoriesProps): React.ReactElement | null {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const { data, isPending } = useStories({ enabled });
  const { data: sidebar } = useSidebar();
  const showSkeleton = useMinimumLoading(isPending);

  if (!enabled) {
    return null;
  }

  // SSR/하이드레이션 시점엔 아직 데이터가 없으므로 isPending=true 가 된다.
  // isLoading 대신 isPending 을 쓰면 서버/클라이언트 양쪽에서 모두 스켈레톤을
  // 그리게 되어 hydration mismatch 없이 자연스럽게 데이터로 전환된다.
  if (showSkeleton) {
    return <StoryRingSkeleton />;
  }

  const groups = data ? sortStoryGroups(data.storyGroups) : [];

  const handleAddStory = (): void => {
    router.push('/diary/create');
  };

  return (
    <>
      <div className="data-fade-in">
        <StoryRing
          groups={groups}
          onSelect={setOpenIndex}
          myProfileImage={sidebar?.profileUrl ?? null}
          onAddStory={handleAddStory}
        />
      </div>
      {openIndex >= 0 ? (
        <StoryViewer
          groups={groups}
          startIndex={openIndex}
          onClose={() => setOpenIndex(-1)}
        />
      ) : null}
    </>
  );
}
