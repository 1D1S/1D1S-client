'use client';

import { Icon } from '@1d1s/design-system';
import EmptyState from '@component/EmptyState';
import FadeInImage from '@component/FadeInImage';
import { cn } from '@module/utils/cn';
import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import Image from 'next/image';
import React from 'react';

import { StoryGroup } from '../type/story';
import { isGroupAllSeen } from '../utils/storyHelpers';

interface StoryRingProps {
  groups: StoryGroup[];
  onSelect(index: number): void;
  myProfileImage?: string | null;
  onAddStory?(): void;
}

interface StoryMood {
  src: string;
  alt: string;
  tint: string;
}

// 감정(무드) 아이콘은 API 에 실제 감정 필드가 없어 userId 로 고정 배정한다.
// 같은 사용자는 항상 같은 무드/틴트를 받는다(장식 목적).
const STORY_MOODS: StoryMood[] = [
  { src: '/images/mood-happy.svg', alt: '행복한 얼굴', tint: 'bg-[#c9f1e7]' },
  { src: '/images/mood-soso.svg', alt: '무표정 얼굴', tint: 'bg-[#e6f1ff]' },
  { src: '/images/mood-sad.svg', alt: '슬픈 얼굴', tint: 'bg-[#fff1c8]' },
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

function pickStoryMood(userId: number): StoryMood {
  return STORY_MOODS[Math.abs(userId) % STORY_MOODS.length];
}

// 사각형 스토리 카드(144x180). 무드 이미지를 크게 중앙에 두고 그 아래
// 프로필 썸네일만 노출한다(닉네임/시간/제목/개수 미표시). 읽음 여부는
// 카드 테두리 색으로 표현한다(안읽음 border-main-500, 읽음 border-gray-200).
function StoryRing({
  groups,
  onSelect,
  myProfileImage,
  onAddStory,
}: StoryRingProps): React.ReactElement {
  const showMySlot = typeof onAddStory === 'function';
  // 내 스토리는 sortStoryGroups 로 항상 맨 앞에 고정된다. 응답에 포함되면
  // 일반 스토리 카드로 렌더돼 뷰어로 열리고, 없으면 일지 작성으로 유도하는
  // 추가 카드를 대신 그린다.
  const hasMyStory = groups.some((group) => group.isMyStory);
  const friendCount = hasMyStory ? groups.length - 1 : groups.length;
  const myImageUrl = resolveDiaryImageUrl(myProfileImage ?? null) ?? undefined;

  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full items-start gap-3',
        'overflow-x-auto py-3.5'
      )}
    >
      {showMySlot && !hasMyStory ? (
        <button
          type="button"
          onClick={onAddStory}
          aria-label="오늘 일지 올리기"
          className={cn(
            'flex h-[180px] w-[144px] shrink-0 flex-col items-center',
            'justify-center gap-3 overflow-hidden rounded-[20px]',
            'border-main-200 border-2 border-dashed bg-white',
            'hover:shadow-warm transition-all duration-300 ease-out'
          )}
        >
          <span
            className={cn(
              'bg-main-500 shadow-warm flex h-14 w-14 items-center',
              'justify-center rounded-full text-white'
            )}
            aria-hidden
          >
            <Icon name="Plus" size={24} />
          </span>
          <span
            className={cn(
              'flex h-11 w-11 items-center justify-center overflow-hidden',
              'rounded-full border-2 border-white bg-[#ffe1a8]'
            )}
            aria-hidden
          >
            {isValidNextImageSrc(myImageUrl) ? (
              <span className="relative h-full w-full">
                <FadeInImage
                  src={myImageUrl}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </span>
            ) : (
              <span className="h-2.5 w-5 rounded-full bg-white" />
            )}
          </span>
        </button>
      ) : null}
      {groups.map((group, index) => {
        const seen = isGroupAllSeen(group);
        const profileUrl =
          resolveDiaryImageUrl(group.profileImage) ?? undefined;
        const name = group.userName?.trim() || `친구 ${group.userId}`;
        const mood = pickStoryMood(group.userId);

        return (
          <button
            key={group.userId}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`${name} 스토리 열기`}
            className={cn(
              'flex h-[180px] w-[144px] shrink-0 flex-col items-center',
              'justify-center gap-3 overflow-hidden rounded-[20px] border-2',
              'hover:shadow-warm transition-all duration-300 ease-out',
              seen ? 'border-gray-200' : 'border-main-500',
              mood.tint
            )}
          >
            {/* 무드 SVG는 정적 에셋이라 Next 이미지 최적화 없이 서빙한다. */}
            <Image
              src={mood.src}
              alt={mood.alt}
              width={56}
              height={56}
              className="h-14 w-14"
              unoptimized
            />
            <span
              className={cn(
                'relative flex h-11 w-11 items-center justify-center',
                'overflow-hidden rounded-full border-2 border-white bg-white'
              )}
              aria-hidden
            >
              {isValidNextImageSrc(profileUrl) ? (
                <FadeInImage
                  src={profileUrl}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <span className="h-3.5 w-6 rounded-full bg-gray-200" />
              )}
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
          compact
          title="친구 스토리가 아직 없어요"
          description="친구를 추가하면 친구들의 일지가 여기에 나타나요"
          className="min-w-[200px] flex-1"
        />
      ) : null}
    </div>
  );
}

// 스토리 뷰어 open/close(부모 state 변경) 때 링 카드 전체가 재렌더되지
// 않도록 React.memo 로 감싼다. 부모는 onSelect/onAddStory 를 안정된
// 참조로 넘겨야 한다.
export default React.memo(StoryRing);
