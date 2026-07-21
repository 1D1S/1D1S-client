'use client';

import { Icon } from '@1d1s/design-system';
import EmptyState from '@component/EmptyState';
import FadeInImage from '@component/FadeInImage';
import { cn } from '@module/utils/cn';
import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import React from 'react';

import { StoryGroup } from '../type/story';
import {
  getStoryPreviewThumbnail,
  isGroupAllSeen,
} from '../utils/storyHelpers';

interface StoryRingProps {
  groups: StoryGroup[];
  onSelect(index: number): void;
  myProfileImage?: string | null;
  onAddStory?(): void;
}

// 카드 배경 틴트 — 감정과 무관한 장식(사용자별 고정 파스텔).
// 과거엔 userId 해시로 감정 얼굴(happy/soso/sad)까지 임의 배정해, 작성자가
// 고른 실제 감정(상세는 정상)과 어긋나 보였다. 스토리 응답엔 feeling 이 없어
// 실제 감정을 그릴 수 없으므로, 감정 얼굴을 제거하고 실제 일지 썸네일을 쓴다.
const CARD_TINTS = ['bg-[#c9f1e7]', 'bg-[#e6f1ff]', 'bg-[#fff1c8]'] as const;

function pickCardTint(userId: number): string {
  return CARD_TINTS[Math.abs(userId) % CARD_TINTS.length];
}

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

// 사각형 스토리 카드(112x140). 무드 이미지를 크게 중앙에 두고 그 아래
// 프로필 썸네일만 노출한다(닉네임/시간/제목/개수 미표시). 읽음 여부는
// 카드 테두리로 표현한다(안읽음 3px border-main-500, 읽음 2px border-gray-200).
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
            'flex h-[140px] w-[112px] shrink-0 flex-col items-center',
            'justify-center gap-2.5 overflow-hidden rounded-[16px]',
            'border-main-200 border-2 border-dashed bg-white',
            'hover:shadow-warm transition-all duration-300 ease-out'
          )}
        >
          <span
            className={cn(
              'bg-main-500 shadow-warm flex h-11 w-11 items-center',
              'justify-center rounded-full text-white'
            )}
            aria-hidden
          >
            <Icon name="Plus" size={20} />
          </span>
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center overflow-hidden',
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
                  sizes="36px"
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
        const tint = pickCardTint(group.userId);
        const previewUrl =
          resolveDiaryImageUrl(getStoryPreviewThumbnail(group)) ?? undefined;

        return (
          <button
            key={group.userId}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`${name} 스토리 열기`}
            className={cn(
              'flex h-[140px] w-[112px] shrink-0 flex-col items-center',
              'justify-center gap-2.5 overflow-hidden rounded-[16px]',
              'hover:shadow-warm transition-all duration-300 ease-out',
              seen
                ? 'border-2 border-gray-200'
                : 'border-main-500 border-[3px]',
              tint
            )}
          >
            {/* 실제 일지 썸네일(감정과 무관한 실제 콘텐츠). 없으면 중립
                placeholder — 잘못된 감정 얼굴을 그리지 않는다. */}
            <span
              className={cn(
                'relative flex h-11 w-11 items-center justify-center',
                'overflow-hidden rounded-[12px] bg-white/70'
              )}
              aria-hidden
            >
              {isValidNextImageSrc(previewUrl) ? (
                <FadeInImage
                  src={previewUrl}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : null}
            </span>
            <span
              className={cn(
                'relative flex h-9 w-9 items-center justify-center',
                'overflow-hidden rounded-full border-2 border-white bg-white'
              )}
              aria-hidden
            >
              {isValidNextImageSrc(profileUrl) ? (
                <FadeInImage
                  src={profileUrl}
                  alt=""
                  fill
                  sizes="36px"
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
