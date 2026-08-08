import { Icon, SegmentedControl, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import {
  formatDateKR,
  getInclusiveDayCount,
  parseDateValue,
} from '@module/utils/date';

import {
  isChallengeEnded,
  isInfiniteChallengeEndDate,
} from '../../board/utils/challengePeriod';
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';

interface ChallengeEditPeriodSectionProps {
  startDate: string;
  endDate: string;
}

export function ChallengeEditPeriodSection({
  startDate,
  endDate,
}: ChallengeEditPeriodSectionProps): React.ReactElement {
  const isEndless = isInfiniteChallengeEndDate(endDate);
  const periodValue: 'ENDLESS' | 'LIMITED' = isEndless ? 'ENDLESS' : 'LIMITED';
  const ended = isChallengeEnded(endDate);
  const durationDays = isEndless
    ? 0
    : getInclusiveDayCount(startDate, endDate) ?? 0;
  const parsedStart = parseDateValue(startDate);
  const parsedEnd = parseDateValue(endDate);
  const startLabel = parsedStart ? formatDateKR(parsedStart) : '-';
  const endLabel = isEndless
    ? '무제한'
    : parsedEnd
      ? formatDateKR(parsedEnd)
      : '-';

  return (
    <ChallengeCreateSectionCard
      step={4}
      title="진행 기간"
      hint="진행 기간은 변경할 수 없어요"
    >
      <SegmentedControl
        value={periodValue}
        onValueChange={() => undefined}
        aria-label="진행 기간 유형"
        options={[
          {
            value: 'ENDLESS',
            label: '무제한',
            icon: <Icon name="Endless" className="h-5 w-5" />,
            disabled: true,
          },
          {
            value: 'LIMITED',
            label: '기간 챌린지',
            icon: <Icon name="Calendar" className="h-5 w-5" />,
            disabled: true,
          },
        ]}
      />

      <div
        className={cn(
          'rounded-2 mt-5 grid grid-cols-1 gap-3 border border-gray-200',
          'bg-gray-50 px-4 py-3 md:grid-cols-3'
        )}
      >
        <div>
          <Text size="caption2" weight="bold" className="block text-gray-500">
            시작일
          </Text>
          <Text
            size="body2"
            weight="bold"
            className="mt-0.5 block text-gray-900"
          >
            {startLabel}
          </Text>
        </div>
        <div>
          <Text size="caption2" weight="bold" className="block text-gray-500">
            종료일
          </Text>
          <Text
            size="body2"
            weight="bold"
            className="mt-0.5 block text-gray-900"
          >
            {endLabel}
          </Text>
        </div>
        <div>
          <Text size="caption2" weight="bold" className="block text-gray-500">
            진행 일수
          </Text>
          <Text
            size="body2"
            weight="bold"
            className="mt-0.5 block text-gray-900"
          >
            {isEndless ? '무제한' : `${durationDays}일`}
          </Text>
        </div>
      </div>

      {ended ? (
        <Text
          size="caption1"
          weight="regular"
          className="mt-3 block text-gray-500"
        >
          이미 종료된 챌린지입니다. 일부 항목만 수정할 수 있어요.
        </Text>
      ) : null}
    </ChallengeCreateSectionCard>
  );
}
