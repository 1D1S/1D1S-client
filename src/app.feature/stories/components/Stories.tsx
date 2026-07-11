'use client';

import { Text } from '@1d1s/design-system';
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
  const lockedCards = [
    {
      surface: 'bg-[linear-gradient(180deg,#ffe1d7_0%,#fff7f3_100%)]',
      active: true,
    },
    {
      surface: 'bg-[linear-gradient(180deg,#def4ec_0%,#f8fffc_100%)]',
      active: false,
    },
    {
      surface: 'bg-[linear-gradient(180deg,#f4e8dc_0%,#fffaf5_100%)]',
      active: false,
    },
  ];

  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full overflow-x-auto',
        'gap-3 py-3.5'
      )}
    >
      {lockedCards.map((card, index) => (
        <button
          key={index}
          type="button"
          onClick={onRequireLogin}
          aria-label="로그인 후 스토리 확인"
          className={cn(
            'relative flex h-[208px] w-[168px] shrink-0 flex-col',
            'overflow-hidden rounded-[22px] border border-gray-100',
            'hover:shadow-warm text-left transition-all duration-300 ease-out',
            card.surface
          )}
        >
          <span className="flex flex-1 items-center justify-center pt-7">
            <span
              className={cn(
                'flex h-13 w-13 items-center justify-center rounded-full',
                'bg-white/80 shadow-sm',
                card.active ? 'text-main-700' : 'text-gray-400'
              )}
              aria-hidden
            >
              <Lock className="h-5 w-5" />
            </span>
          </span>

          <span className="px-4 pb-6">
            {card.active ? (
              <>
                <Text
                  size="body2"
                  weight="extrabold"
                  className="block text-gray-900"
                >
                  친구 스토리
                </Text>
                <span
                  className={cn(
                    'mt-1 inline-flex items-center gap-1 text-[13px]',
                    'text-main-800 font-extrabold'
                  )}
                >
                  로그인하고 확인하기
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </>
            ) : (
              <span className="flex items-center gap-3">
                <span
                  className="h-9 w-9 shrink-0 rounded-full bg-white/50"
                  aria-hidden
                />
                <span
                  className="h-3 w-30 rounded-full bg-white/50"
                  aria-hidden
                />
              </span>
            )}
          </span>
        </button>
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
