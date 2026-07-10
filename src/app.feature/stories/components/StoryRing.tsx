'use client';

import { Icon, Text } from '@1d1s/design-system';
import EmptyState from '@component/EmptyState';
import FadeInImage from '@component/FadeInImage';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

import { StoryGroup } from '../type/story';
import {
  formatStoryDate,
  isGroupAllSeen,
} from '../utils/storyHelpers';

interface StoryRingProps {
  groups: StoryGroup[];
  onSelect(index: number): void;
  compact?: boolean;
  myProfileImage?: string | null;
  onAddStory?(): void;
}

interface StoryVisual {
  badge: string;
  moodImage: { src: string; alt: string };
  surface: string;
  accent: string;
  avatar: string;
}

const STORY_VISUALS: StoryVisual[] = [
  {
    badge: '뿌듯함',
    moodImage: { src: '/images/mood-happy.svg', alt: '행복한 얼굴' },
    surface: 'bg-[linear-gradient(180deg,#ffe1d7_0%,#fff7f3_100%)]',
    accent: 'text-main-800',
    avatar: 'border-main-500 bg-[#c9f1e7]',
  },
  {
    badge: '좋아요',
    moodImage: { src: '/images/mood-soso.svg', alt: '무표정 얼굴' },
    surface: 'bg-[linear-gradient(180deg,#def4ec_0%,#f8fffc_100%)]',
    accent: 'text-green-800',
    avatar: 'border-green-700 bg-[#e6f1ff]',
  },
  {
    badge: '기록',
    moodImage: { src: '/images/mood-sad.svg', alt: '슬픈 얼굴' },
    surface: 'bg-[linear-gradient(180deg,#f4e8dc_0%,#fffaf5_100%)]',
    accent: 'text-gray-700',
    avatar: 'border-main-400 bg-[#fff1c8]',
  },
];

// next/image 는 절대 URL 또는 / 시작 상대 경로만 허용한다.
function isValidNextImageSrc(src: string | undefined): src is string {
  if (!src) {
    return false;
  }
  if (src.startsWith('/')) {
    return true;
  }
  return /^(https?:|data:|blob:)/i.test(src);
}

function pickStoryVisual(userId: number): StoryVisual {
  return STORY_VISUALS[userId % STORY_VISUALS.length];
}

function StoryRing({
  groups,
  onSelect,
  compact = false,
  myProfileImage,
  onAddStory,
}: StoryRingProps): React.ReactElement {
  const showMySlot = typeof onAddStory === 'function';
  const cardWidthClass = compact ? 'w-[136px]' : 'w-[168px]';
  const cardHeightClass = compact ? 'h-[174px]' : 'h-[208px]';
  // 내 스토리는 sortStoryGroups 로 항상 맨 앞에 고정된다. 응답에 포함되면
  // 일반 스토리 카드로 렌더돼 뷰어로 열리고, 없으면 일지 작성으로 유도하는
  // 추가 카드를 대신 그린다.
  const hasMyStory = groups.some((group) => group.isMyStory);
  const friendCount = hasMyStory ? groups.length - 1 : groups.length;
  const myImageUrl = resolveDiaryImageUrl(myProfileImage ?? null) ?? undefined;

  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full overflow-x-auto',
        compact ? 'gap-2.5 px-4 py-3' : 'gap-3 px-5 py-3.5 lg:px-8'
      )}
    >
      {showMySlot && !hasMyStory ? (
        <button
          type="button"
          onClick={onAddStory}
          aria-label="오늘 일지 올리기"
          className={cn(
            'flex shrink-0 flex-col overflow-hidden rounded-[22px]',
            'border-main-200 border border-dashed bg-white text-left',
            'hover:shadow-warm transition-all duration-300 ease-out',
            cardWidthClass,
            cardHeightClass
          )}
        >
          <span
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-3',
              'px-4 text-center'
            )}
          >
            <span
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full',
                'bg-main-500 shadow-warm text-white'
              )}
              aria-hidden
            >
              <Icon name="Plus" size={24} />
            </span>
            <Text size="caption2" weight="extrabold" className="text-main-800">
              오늘 일지 올리기
            </Text>
          </span>
          <span className="flex items-center gap-3 px-4 pb-6">
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center',
                'overflow-hidden rounded-full bg-[#ffe1a8]'
              )}
              aria-hidden
            >
              {isValidNextImageSrc(myImageUrl) ? (
                <span className="relative h-full w-full">
                  <FadeInImage
                    src={myImageUrl}
                    alt=""
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </span>
              ) : (
                <span className="h-2 w-4 rounded-full bg-white" />
              )}
            </span>
            <span className="min-w-0 text-base font-extrabold text-gray-900">
              내 스토리
            </span>
          </span>
        </button>
      ) : null}
      {groups.map((group, index) => {
        const seen = isGroupAllSeen(group);
        const [preview] = group.stories;
        const profileUrl =
          resolveDiaryImageUrl(group.profileImage) ?? undefined;
        const name = group.userName?.trim() || `친구 ${group.userId}`;
        const title = preview?.diaryTitle ?? '';
        const time = preview ? formatStoryDate(preview.createdAt) : '';
        const visual = pickStoryVisual(group.userId);
        const unreadCount = group.stories.filter(
          (story) => story.hasUnreadJournal
        ).length;

        return (
          <button
            key={group.userId}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`${name} 스토리 열기`}
            className={cn(
              'relative flex shrink-0 flex-col overflow-hidden rounded-[22px]',
              'border bg-white text-left transition-all duration-300 ease-out',
              'hover:shadow-warm',
              seen ? 'border-gray-100' : 'border-main-200',
              visual.surface,
              cardWidthClass,
              cardHeightClass
            )}
          >
            <span
              className={cn(
                'absolute top-4 left-4 inline-flex max-w-[112px]',
                'items-center gap-1 rounded-full bg-white/75 px-2.5 py-1',
                'text-[11px] font-extrabold',
                visual.accent
              )}
            >
              <Icon name="Flag" size={10} aria-hidden />
              <span className="truncate">{title || visual.badge}</span>
            </span>
            {!seen ? (
              <span
                className={cn(
                  'absolute top-4 right-4 flex h-5 min-w-5 items-center',
                  'bg-main-600 justify-center rounded-full px-1',
                  'text-[11px] font-bold text-white ring-2 ring-white'
                )}
                aria-label={`${unreadCount || 1}개 새 스토리`}
              >
                {unreadCount || 1}
              </span>
            ) : null}

            <span
              className={cn(
                'flex flex-1 items-center justify-center pt-9',
                'px-4'
              )}
            >
              {/* 무드 SVG는 정적 에셋이라 Next 이미지 최적화 없이 서빙한다. */}
              <Image
                src={visual.moodImage.src}
                alt={visual.moodImage.alt}
                width={56}
                height={56}
                className="h-14 w-14"
                unoptimized
              />
            </span>

            <span className="flex items-end gap-3 px-4 pb-6">
              <span
                className={cn(
                  'relative flex h-10 w-10 shrink-0 items-center',
                  'justify-center overflow-hidden rounded-full border-2',
                  visual.avatar
                )}
                aria-hidden
              >
                {isValidNextImageSrc(profileUrl) ? (
                  <FadeInImage
                    src={profileUrl}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <span className="h-4 w-7 rounded-full bg-white/80" />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    'block truncate text-base font-extrabold',
                    seen ? 'text-gray-700' : 'text-gray-900'
                  )}
                >
                  {name}
                </span>
                <span
                  className={cn(
                    'block truncate text-[13px] font-medium',
                    seen ? 'text-gray-400' : 'text-gray-500'
                  )}
                >
                  {time}
                </span>
              </span>
            </span>
          </button>
        );
      })}
      {/* 내 스토리 카드(groups 맨 앞에 정렬됨) 뒤에 두어야 flex 행에서
          빈 상태가 내 스토리 오른쪽에 그려진다. 앞에 두면 flex-1 이
          왼쪽을 차지해 내 스토리가 오른쪽 끝으로 밀린다. */}
      {showMySlot && friendCount === 0 ? (
        <EmptyState
          variant="friends"
          animate={false}
          title="친구 스토리가 아직 없어요"
          description="친구를 추가하면 친구들의 일지가 여기에 나타나요"
          className="min-w-[220px] flex-1 py-6"
        />
      ) : null}
    </div>
  );
}

// 스토리 뷰어 open/close(부모 state 변경) 때 링 카드 전체가 재렌더되지
// 않도록 React.memo 로 감싼다. 부모는 onSelect/onAddStory 를 안정된
// 참조로 넘겨야 한다.
export default React.memo(StoryRing);
