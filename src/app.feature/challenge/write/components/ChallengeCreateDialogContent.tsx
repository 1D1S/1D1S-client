import { Icon, Tag, Text } from '@1d1s/design-system';
import { CATEGORY_OPTIONS } from '@constants/categories';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';

import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';

/**
 * ChallengeCreateDialogContent
 * 챌린지 생성 다이얼로그의 내용 컴포넌트
 */
export function ChallengeCreateDialogContent(): React.ReactElement {
  const { getValues } = useFormContext<ChallengeCreateFormValues>();
  const values = getValues();
  const category = CATEGORY_OPTIONS.find(
    (option) => option.value === values.category
  );

  const periodValue =
    values.period !== 'etc' ? values.period : values.periodNumber;
  const memberCountLabel =
    values.memberCount === 'unlimited'
      ? '제한 없음'
      : values.memberCount === 'etc'
        ? `${values.memberCountNumber}명`
        : values.memberCount
          ? `${values.memberCount}명`
          : '-';
  const isFlexible = values.goalType === 'FLEXIBLE';
  const isEndless = values.periodType === 'ENDLESS';
  const isGroup = values.participationType === 'GROUP';
  const isPrivate = values.challengeType === 'PRIVATE';

  return (
    <div className="flex flex-col gap-4">
      {/* 대표 사진 */}
      {values.thumbnailPreviewUrl && (
        <div className="rounded-2 relative aspect-[21/9] w-full overflow-hidden">
          <Image
            src={values.thumbnailPreviewUrl}
            alt="챌린지 대표 사진"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* 카테고리 + 제목 */}
      <div className="flex flex-col gap-2">
        {category && (
          <div className="flex">
            <Tag
              icon={<Icon name={category.iconName} className="h-3.5 w-3.5" />}
            >
              {category.label}
            </Tag>
          </div>
        )}
        <Text size="heading1" weight="bold" className="text-black">
          {values.title}
        </Text>
      </div>

      {/* 설명 */}
      {values.description && (
        <div className="border-l-main-700 rounded-r-2 border-l-4 bg-gray-50 px-4 py-3">
          <Text size="body2" weight="regular" className="text-gray-700">
            {values.description}
          </Text>
        </div>
      )}

      {/* 기간 / 인원 / 목표 카드 */}
      <div className="rounded-2 overflow-hidden border border-gray-200">
        {/* 기간 + 인원 */}
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          {/* 기간 */}
          <div className="flex flex-col gap-1 p-4">
            <Text size="caption1" weight="regular" className="text-gray-400">
              챌린지 기간
            </Text>
            <Text size="heading2" weight="bold" className="text-black">
              {isEndless ? '무한' : `${periodValue}일`}
            </Text>
            {!isEndless && values.startDate && (
              <Text size="caption1" weight="regular" className="text-gray-400">
                {format(values.startDate, 'yyyy-MM-dd')} 시작
              </Text>
            )}
          </div>

          {/* 인원 */}
          <div className="flex flex-col gap-1 p-4">
            <Text size="caption1" weight="regular" className="text-gray-400">
              참여 인원
            </Text>
            <Text size="heading2" weight="bold" className="text-black">
              {isGroup ? memberCountLabel : '개인'}
            </Text>
            <div>
              <Tag>{isGroup ? '단체 챌린지' : '개인 챌린지'}</Tag>
            </div>
          </div>
        </div>

        {/* 공개 범위 + 중도 참여 */}
        <div className="grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200">
          {/* 공개 범위 */}
          <div className="flex flex-col gap-1 p-4">
            <Text size="caption1" weight="regular" className="text-gray-400">
              공개 범위
            </Text>
            <Text size="heading2" weight="bold" className="text-black">
              {isPrivate ? '비공개' : '공개'}
            </Text>
            <div>
              <Tag>{isPrivate ? '비밀번호 필요' : '누구나 참여'}</Tag>
            </div>
          </div>

          {/* 중도 참여 */}
          <div className="flex flex-col gap-1 p-4">
            <Text size="caption1" weight="regular" className="text-gray-400">
              중도 참여
            </Text>
            <Text size="heading2" weight="bold" className="text-black">
              {isGroup ? (values.allowMidJoin ? '허용' : '비허용') : '개인'}
            </Text>
            <div>
              <Tag>
                {!isGroup
                  ? '개인 챌린지'
                  : values.allowMidJoin
                    ? '시작 후 참여 가능'
                    : '시작 후 참여 불가'}
              </Tag>
            </div>
          </div>
        </div>

        {/* 목표 */}
        <div className="border-t border-gray-200 p-4">
          <Text size="caption1" weight="regular" className="text-gray-400">
            챌린지 목표
          </Text>
          <div className="mt-3 flex flex-col gap-2">
            {isFlexible ? (
              <div className="flex items-center gap-2">
                <div className="bg-main-700 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <Tag>자유 목표</Tag>
              </div>
            ) : (
              values.goals.map((goal, index) => (
                <div
                  key={`${index}-${goal.value}`}
                  className="flex items-center gap-2"
                >
                  <div className="bg-main-700 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <Text size="body2" weight="regular" className="text-black">
                    {goal.value}
                  </Text>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
