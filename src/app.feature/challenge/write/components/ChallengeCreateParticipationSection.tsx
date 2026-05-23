import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { type ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app.component/ui/Form';

import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';
import { ChallengeCreateChip } from './ChallengeCreateChip';
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';
import { ChallengeCreateSegmentToggle } from './ChallengeCreateSegmentToggle';

const MEMBER_COUNT_OPTIONS: Array<{
  value: '2' | '5' | '10' | 'etc' | 'unlimited';
  label: string;
}> = [
  { value: '2', label: '2명' },
  { value: '5', label: '5명' },
  { value: '10', label: '10명' },
  { value: 'etc', label: '직접 입력' },
  { value: 'unlimited', label: '제한 없음' },
];

export function ChallengeCreateParticipationSection(): React.ReactElement {
  const { control, setValue, watch } =
    useFormContext<ChallengeCreateFormValues>();
  const participationType = watch('participationType');
  const memberCount = watch('memberCount');
  const isGroup = participationType === 'GROUP';

  return (
    <ChallengeCreateSectionCard step={2} title="참여 형태">
      <FormField
        control={control}
        name="participationType"
        render={({ field }) => (
          <FormItem>
            <ChallengeCreateSegmentToggle
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                if (value === 'INDIVIDUAL') {
                  // 개인 챌린지는 자유 목표 선택이 불가능하므로 FIXED 로 동기화한다.
                  setValue('goalType', 'FIXED', { shouldValidate: true });
                }
              }}
              ariaLabel="참여 형태"
              options={[
                { value: 'INDIVIDUAL', label: '개인 챌린지', icon: '🙋' },
                { value: 'GROUP', label: '단체 챌린지', icon: '👥' },
              ]}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <Text
        size="caption1"
        weight="regular"
        className="mt-2 block text-gray-500"
      >
        {isGroup
          ? '여러 명이 함께 같은 챌린지에 참여해요. 서로 응원하며 스트릭을 이어갈 수 있어요.'
          : '나 혼자 묵묵히 도전해요. 일지는 비공개로 둘 수도 있어요.'}
      </Text>

      {isGroup ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Text
              size="caption1"
              weight="bold"
              className="block text-gray-600"
            >
              최대 인원
            </Text>
            <FormField
              control={control}
              name="memberCount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap gap-1.5">
                    {MEMBER_COUNT_OPTIONS.map((option) => (
                      <ChallengeCreateChip
                        key={option.value}
                        active={field.value === option.value}
                        onClick={() => field.onChange(option.value)}
                      >
                        {option.label}
                      </ChallengeCreateChip>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {memberCount === 'etc' ? (
              <FormField
                control={control}
                name="memberCountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={3}
                        placeholder="2 ~ 100"
                        value={field.value ?? ''}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          field.onChange(
                            event.target.value.replace(/\D/g, '')
                          );
                        }}
                        className={cn(
                          'rounded-2 w-full border border-gray-200',
                          'bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900',
                          'focus:border-main-800 outline-none'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <Text
              size="caption1"
              weight="bold"
              className="block text-gray-600"
            >
              중도 참여
            </Text>
            <FormField
              control={control}
              name="allowMidJoin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ChallengeCreateSegmentToggle
                      value={field.value ? 'ALLOW' : 'BEFORE_START'}
                      onChange={(value) =>
                        field.onChange(value === 'ALLOW')
                      }
                      ariaLabel="중도 참여 허용"
                      options={[
                        { value: 'BEFORE_START', label: '시작 전까지만' },
                        { value: 'ALLOW', label: '허용' },
                      ]}
                    />
                  </FormControl>
                  <Text
                    size="caption1"
                    weight="regular"
                    className="mt-1 block text-gray-500"
                  >
                    {field.value
                      ? '챌린지가 시작된 후에도 합류 가능'
                      : '시작일 전에 모집을 마감해요'}
                  </Text>
                </FormItem>
              )}
            />
          </div>
        </div>
      ) : null}
    </ChallengeCreateSectionCard>
  );
}
