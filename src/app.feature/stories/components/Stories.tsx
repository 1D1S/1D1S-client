'use client';

import { Card, Stripe, Text } from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { ArrowRight, Lock } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';

import { useStories } from '../hooks/useStoryQueries';
import { sortStoryGroups } from '../utils/storyHelpers';
import StoryRing from './StoryRing';
import StoryRingSkeleton from './StoryRingSkeleton';

const StoryViewer = dynamic(() => import('./StoryViewer'), {
  ssr: false,
});

interface StoriesProps {
  /** 스토리 조회 가능 여부 */
  isLoggedIn: boolean;
  /** 스토리 조회 쿼리 활성화 여부 */
  fetchEnabled?: boolean;
  /** 비로그인 상태에서 스토리 영역 클릭 시 동작 */
  onRequireLogin?(): void;
}

function StoryLoginPrompt({
  onRequireLogin,
}: {
  onRequireLogin?(): void;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full overflow-x-auto',
        'gap-3 px-5 py-3.5 lg:px-8'
      )}
    >
      <Card
        interactive
        radius="md"
        role="button"
        tabIndex={0}
        onClick={onRequireLogin}
        aria-label="로그인 후 스토리 확인"
        className={cn(
          'w-[140px] flex-shrink-0 transition-all duration-300 ease-out',
          'hover:shadow-warm'
        )}
      >
        <Card.Thumb className="bg-main-100 aspect-[4/5]">
          <Stripe tone="peach" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full',
                'text-main-700 bg-white/80 shadow-sm'
              )}
              aria-hidden
            >
              <Lock className="h-5 w-5" />
            </span>
          </div>
        </Card.Thumb>
        <Card.Body className="gap-1 p-3">
          <Text
            size="caption2"
            weight="extrabold"
            className="truncate leading-snug tracking-tight text-gray-900"
          >
            친구 스토리
          </Text>
          <span
            className={cn(
              'text-main-800 inline-flex items-center gap-1',
              'text-[11px] font-bold'
            )}
          >
            로그인하고 확인하기
            <ArrowRight className="h-3 w-3" />
          </span>
        </Card.Body>
      </Card>

      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          interactive
          radius="md"
          role="button"
          tabIndex={0}
          onClick={onRequireLogin}
          aria-label="로그인 후 스토리 확인"
          className={cn(
            'w-[140px] flex-shrink-0 transition-all duration-300 ease-out',
            'hover:shadow-warm'
          )}
        >
          <Card.Thumb className="aspect-[4/5] bg-gray-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  'bg-white/70 text-gray-400 shadow-sm'
                )}
                aria-hidden
              >
                <Lock className="h-4 w-4" />
              </span>
            </div>
          </Card.Thumb>
          <Card.Body className="gap-1.5 p-3">
            <div className="h-3 w-3/4 rounded bg-gray-200" />
            <Card.Meta>
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span
                  className={cn(
                    'relative h-5 w-5 shrink-0 overflow-hidden rounded-full',
                    'bg-gray-200'
                  )}
                  aria-hidden
                />
                <span className="h-2.5 w-12 rounded bg-gray-200" />
              </span>
            </Card.Meta>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default function Stories({
  isLoggedIn,
  fetchEnabled = true,
  onRequireLogin,
}: StoriesProps): React.ReactElement {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const { data, isPending } = useStories({
    enabled: fetchEnabled && isLoggedIn,
  });
  const { data: sidebar } = useSidebar();
  const showSkeleton = useMinimumLoading(isPending);

  // 정렬 결과를 매 렌더마다 새로 만들면 배열 ID 가 바뀌어 뷰어의 자동 전환
  // 타이머가 끊기고 인덱스가 흔들린다. data 가 바뀔 때만 재정렬한다.
  const groups = useMemo(
    () => (data ? sortStoryGroups(data.storyGroups) : []),
    [data]
  );
  // 인라인 핸들러는 매 렌더마다 새로 생성돼 뷰어의 콜백 안정성과
  // React.memo(StoryRing) 를 깬다.
  const handleCloseViewer = useCallback(() => setOpenIndex(-1), []);
  const handleAddStory = useCallback(() => {
    router.push('/diary/create');
  }, [router]);

  if (!isLoggedIn) {
    return <StoryLoginPrompt onRequireLogin={onRequireLogin} />;
  }

  // SSR/하이드레이션 시점엔 아직 데이터가 없으므로 isPending=true 가 된다.
  // isLoading 대신 isPending 을 쓰면 서버/클라이언트 양쪽에서 모두 스켈레톤을
  // 그리게 되어 hydration mismatch 없이 자연스럽게 데이터로 전환된다.
  if (showSkeleton) {
    return <StoryRingSkeleton />;
  }

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
          key={openIndex}
          groups={groups}
          startIndex={openIndex}
          onClose={handleCloseViewer}
        />
      ) : null}
    </>
  );
}
