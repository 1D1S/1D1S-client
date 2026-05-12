import { Stripe, Tag, Text } from '@1d1s/design-system';
import { CATEGORY_OPTIONS } from '@constants/categories';
import { cn } from '@module/utils/cn';
import { add } from 'date-fns';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';

import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';

const CATEGORY_TONE: Record<string, string> = {
  DEV: 'blue',
  EXERCISE: 'peach',
  BOOK: 'mint',
  MUSIC: 'rose',
  STUDY: 'cream',
  LEISURE: 'sky',
  ECONOMY: 'gray',
};

function formatDateKR(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function resolveDays(values: ChallengeCreateFormValues): number {
  if (values.periodType !== 'LIMITED') {
    return 0;
  }
  const raw = values.period === 'etc' ? values.periodNumber : values.period;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function resolveDurationLabel(values: ChallengeCreateFormValues): string {
  if (values.periodType === 'ENDLESS') {
    return '무제한';
  }
  const days = resolveDays(values);
  if (!values.startDate || days <= 0) {
    return days > 0 ? `${days}일` : '기간 미설정';
  }
  const end = add(values.startDate, { days: Math.max(0, days - 1) });
  return `${formatDateKR(values.startDate)} – ${formatDateKR(end)} · ${days}일`;
}

function resolveMemberLabel(values: ChallengeCreateFormValues): string {
  if (values.participationType === 'INDIVIDUAL') {
    return '나만';
  }
  if (values.memberCount === 'unlimited') {
    return '제한 없음';
  }
  const raw =
    values.memberCount === 'etc'
      ? values.memberCountNumber
      : values.memberCount;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return '미설정';
  }
  return `최대 ${parsed}명`;
}

export function ChallengeCreatePreviewCard(): React.ReactElement {
  const { watch } = useFormContext<ChallengeCreateFormValues>();
  const values = watch();

  const category = CATEGORY_OPTIONS.find(
    (option) => option.value === values.category
  );
  const tone = values.category ? CATEGORY_TONE[values.category] : 'cream';
  const filledGoals = (values.goals ?? [])
    .map((goal) => goal.value)
    .filter(Boolean);
  const isFlexible = values.goalType === 'FLEXIBLE';

  return (
    <div
      className={cn(
        'rounded-3 overflow-hidden border border-gray-200 bg-white'
      )}
    >
      <div className="relative h-[140px]">
        {values.thumbnailPreviewUrl ? (
          <Image
            src={values.thumbnailPreviewUrl}
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
          {values.participationType === 'INDIVIDUAL' ? '개인' : '단체'}
        </div>
      </div>

      <div className="p-4">
        {category ? (
          <Tag tone="brand" size="sm" icon={category.icon}>
            {category.label}
          </Tag>
        ) : null}

        <Text
          size="heading2"
          weight="bold"
          className="mt-2.5 mb-1.5 block min-h-[22px] -tracking-[0.3px] text-gray-900"
        >
          {values.title || (
            <span className="text-gray-400">챌린지 제목</span>
          )}
        </Text>

        <Text
          size="caption1"
          weight="regular"
          className="block min-h-9 leading-relaxed text-gray-600"
        >
          {values.description || (
            <span className="text-gray-400">
              한 줄 설명이 여기 표시돼요
            </span>
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
            <div className="font-bold text-gray-900">
              {resolveMemberLabel(values)}
            </div>
          </div>
          <div>
            <div className="mb-0.5 text-gray-500">목표 유형</div>
            <div className="font-bold text-gray-900">
              {isFlexible ? '자유 목표' : '고정 목표'}
            </div>
          </div>
          <div className="col-span-2">
            <div className="mb-0.5 text-gray-500">기간</div>
            <div className="font-bold text-gray-900">
              {resolveDurationLabel(values)}
            </div>
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
