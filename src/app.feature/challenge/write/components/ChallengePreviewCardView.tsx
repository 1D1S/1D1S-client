import { Icon, Stripe, Tag, Text } from '@1d1s/design-system';
import { CATEGORY_OPTIONS } from '@constants/categories';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

const CATEGORY_TONE: Record<string, string> = {
  DEV: 'blue',
  EXERCISE: 'peach',
  BOOK: 'mint',
  DIET: 'cream',
  HEALTH: 'mint',
  HOBBY: 'rose',
  LANGUAGE: 'sky',
  SELF_DEV: 'blue',
  ETC: 'gray',
};

export interface ChallengePreviewCardViewProps {
  /** values.category (미선택 시 undefined) */
  categoryValue?: string;
  thumbnailPreviewUrl?: string;
  title?: string;
  description?: string;
  /** 단체 챌린지 여부 — 배지 '개인'/'단체' 표기 */
  isGroup: boolean;
  memberLabel: string;
  durationLabel: string;
  isFlexible: boolean;
  filledGoals: string[];
}

/**
 * 챌린지 생성/수정 미리보기 카드의 공통 프레젠테이션 뷰.
 *
 * Create/Edit 폼은 값 모델이 서로 달라(enum vs boolean/기간) 폼 자체는
 * 통합하지 않되, 미리보기 카드의 "표시(chrome)"는 동일하므로 각 폼이
 * 원시값으로 변환해 이 뷰에 주입한다. 출력은 기존과 완전히 동일하다.
 */
export function ChallengePreviewCardView({
  categoryValue,
  thumbnailPreviewUrl,
  title,
  description,
  isGroup,
  memberLabel,
  durationLabel,
  isFlexible,
  filledGoals,
}: ChallengePreviewCardViewProps): React.ReactElement {
  const category = CATEGORY_OPTIONS.find(
    (option) => option.value === categoryValue
  );
  const tone = categoryValue ? CATEGORY_TONE[categoryValue] : 'cream';

  return (
    <div
      className={cn(
        'rounded-3 overflow-hidden border border-gray-200 bg-white'
      )}
    >
      <div className="relative aspect-[21/9] w-full">
        {thumbnailPreviewUrl ? (
          <Image
            src={thumbnailPreviewUrl}
            alt="챌린지 대표 사진 미리보기"
            fill
            className="object-cover"
          />
        ) : (
          <Stripe tone={tone} label={category?.label ?? '카테고리'} />
        )}
        <div
          className={cn(
            'text-main-800 absolute top-2.5 right-2.5 rounded-full',
            'bg-white px-2.5 py-0.5 text-[10px] font-bold'
          )}
        >
          {isGroup ? '단체' : '개인'}
        </div>
      </div>

      <div className="p-4">
        {category ? (
          <Tag
            tone="brand"
            size="sm"
            icon={<Icon name={category.iconName} className="h-3 w-3" />}
          >
            {category.label}
          </Tag>
        ) : null}

        <Text
          size="heading2"
          weight="bold"
          className={cn(
            'mt-2.5 mb-1.5 block min-h-[22px]',
            '-tracking-[0.3px] text-gray-900'
          )}
        >
          {title || <span className="text-gray-400">챌린지 제목</span>}
        </Text>

        <Text
          size="caption1"
          weight="regular"
          className="block min-h-9 leading-relaxed text-gray-600"
        >
          {description || (
            <span className="text-gray-400">한 줄 설명이 여기 표시돼요</span>
          )}
        </Text>

        <div
          className={cn(
            'mt-3 grid grid-cols-2 gap-2.5 border-t border-dashed',
            'border-gray-200 pt-3 text-[11px]'
          )}
        >
          <div>
            <div className="mb-0.5 text-gray-500">인원</div>
            <div className="font-bold text-gray-900">{memberLabel}</div>
          </div>
          <div>
            <div className="mb-0.5 text-gray-500">목표 유형</div>
            <div className="font-bold text-gray-900">
              {isFlexible ? '자유 목표' : '고정 목표'}
            </div>
          </div>
          <div className="col-span-2">
            <div className="mb-0.5 text-gray-500">기간</div>
            <div className="font-bold text-gray-900">{durationLabel}</div>
          </div>
        </div>

        <div
          className={cn(
            'border-main-200 bg-main-100 rounded-2 mt-3 border px-3 py-2.5'
          )}
        >
          <Text
            size="caption2"
            weight="bold"
            className="text-main-800 block tracking-[0.3px]"
          >
            목표
          </Text>
          {isFlexible ? (
            <Text
              size="body2"
              weight="bold"
              className="mt-1 block text-gray-900"
            >
              참여자가 자신만의 목표를 설정해요
            </Text>
          ) : filledGoals.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {filledGoals.map((goal, index) => (
                <li
                  key={`${index}-${goal}`}
                  className="text-[12px] font-bold text-gray-900"
                >
                  · {goal}
                </li>
              ))}
            </ul>
          ) : (
            <Text
              size="body2"
              weight="regular"
              className="mt-1 block text-gray-400"
            >
              공통 목표를 설정해 주세요
            </Text>
          )}
        </div>
      </div>
    </div>
  );
}
