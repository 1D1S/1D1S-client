import { Icon, Tag, Text } from '@1d1s/design-system';
import { CATEGORY_OPTIONS } from '@constants/categories';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';

import { isInfiniteChallengeEndDate } from '../../board/utils/challengePeriod';
import { ChallengeEditFormValues } from '../hooks/useChallengeEditForm';

interface ChallengeEditDialogContentProps {
  startDate: string;
  endDate: string;
}

export function ChallengeEditDialogContent({
  startDate,
  endDate,
}: ChallengeEditDialogContentProps): React.ReactElement {
  const { getValues } = useFormContext<ChallengeEditFormValues>();
  const values = getValues();
  const category = CATEGORY_OPTIONS.find(
    (option) => option.value === values.category
  );

  const memberCountValue =
    values.memberCount === 'unlimited'
      ? '제한 없음'
      : values.memberCount === 'etc'
        ? `${values.memberCountNumber}명`
        : values.memberCount
          ? `${values.memberCount}명`
          : '-';
  const isFlexible = !values.isFixedGoal;
  const isEndless = isInfiniteChallengeEndDate(endDate);
  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);
  const startLabel = Number.isNaN(parsedStart.getTime())
    ? '-'
    : format(parsedStart, 'yyyy-MM-dd');
  const endLabel = isEndless
    ? '무제한'
    : Number.isNaN(parsedEnd.getTime())
      ? '-'
      : format(parsedEnd, 'yyyy-MM-dd');

  return (
    <div className="flex flex-col gap-4">
      {values.thumbnailPreviewUrl ? (
        <div className="rounded-2 relative aspect-[21/9] w-full overflow-hidden">
          <Image
            src={values.thumbnailPreviewUrl}
            alt="챌린지 대표 사진"
            fill
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {category ? (
          <div className="flex">
            <Tag
              icon={<Icon name={category.iconName} className="h-3.5 w-3.5" />}
            >
              {category.label}
            </Tag>
          </div>
        ) : null}
        <Text size="heading1" weight="bold" className="text-black">
          {values.title}
        </Text>
      </div>

      {values.description ? (
        <div className="border-l-main-700 rounded-r-2 border-l-4 bg-gray-50 px-4 py-3">
          <Text size="body2" weight="regular" className="text-gray-700">
            {values.description}
          </Text>
        </div>
      ) : null}

      <div className="rounded-2 overflow-hidden border border-gray-200">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="flex flex-col gap-1 p-4">
            <Text size="caption1" weight="regular" className="text-gray-400">
              챌린지 기간
            </Text>
            <Text size="heading2" weight="bold" className="text-black">
              {isEndless ? '무제한' : endLabel}
            </Text>
            <Text size="caption1" weight="regular" className="text-gray-400">
              {startLabel} 시작
            </Text>
          </div>

          <div className="flex flex-col gap-1 p-4">
            <Text size="caption1" weight="regular" className="text-gray-400">
              참여 인원
            </Text>
            <Text size="heading2" weight="bold" className="text-black">
              {values.isGroup ? memberCountValue : '개인'}
            </Text>
            <div>
              <Tag>{values.isGroup ? '단체 챌린지' : '개인 챌린지'}</Tag>
            </div>
          </div>
        </div>

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
