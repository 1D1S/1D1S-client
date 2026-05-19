import {
  Card,
  cn,
  Icon,
  Stripe,
  Tag,
  type TagProps,
  Text,
} from '@1d1s/design-system';
import { createActivationKeydownHandler } from '@module/utils/event';
import Image from 'next/image';

export interface ChallengeListItemProps {
  challengeTitle: string;
  challengeType: string;
  challengeCategory?: string;
  imageUrl?: string;
  currentUserCount: number;
  maxUserCount: number;
  startDate: string;
  endDate: string;
  isInfiniteChallenge?: boolean;
  isEarlyEnded?: boolean;
  isOngoing: boolean;
  isEnded?: boolean;
  className?: string;
  onClick?(): void;
}

type StatusTone = NonNullable<TagProps['tone']>;

export function ChallengeListItem({
  challengeTitle,
  challengeType,
  challengeCategory,
  imageUrl,
  currentUserCount,
  maxUserCount,
  startDate,
  endDate,
  isInfiniteChallenge = false,
  isEarlyEnded = false,
  isOngoing,
  isEnded = false,
  className,
  onClick,
}: ChallengeListItemProps): React.ReactElement {
  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);
  const isIndividual = maxUserCount <= 1;

  const hasEnded = isInfiniteChallenge ? isEarlyEnded : isEnded;
  const statusLabel = hasEnded ? '종료됨' : isOngoing ? '진행 중' : '모집 중';
  const statusTone: StatusTone = hasEnded
    ? 'gray'
    : isOngoing
      ? 'mint'
      : 'blue';

  const dateLabel = isInfiniteChallenge
    ? `${startDate} · 무한`
    : `${startDate} ~ ${endDate}`;

  return (
    <Card
      interactive={Boolean(onClick)}
      radius="md"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={createActivationKeydownHandler(onClick)}
      className={cn(
        'flex gap-3 overflow-hidden p-0 sm:gap-4',
        onClick &&
          'hover:shadow-warm transition-all duration-200',
        className
      )}
    >
      <div
        className={cn(
          'bg-main-100 relative h-[104px] w-[104px] shrink-0 overflow-hidden',
          'sm:h-[120px] sm:w-[120px]'
        )}
      >
        {hasImage ? (
          <Image
            src={imageUrl as string}
            alt={challengeTitle}
            fill
            sizes="120px"
            className="object-cover"
          />
        ) : (
          <Stripe tone="peach" />
        )}
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col justify-center gap-1.5',
          'py-3 pr-3 sm:py-4 sm:pr-4'
        )}
      >
        <Text
          as="p"
          size="body2"
          weight="extrabold"
          className="truncate text-gray-900 sm:text-[17px]"
        >
          {challengeTitle}
        </Text>

        <div className="flex flex-wrap items-center gap-1.5">
          {challengeCategory && (
            <Tag tone="brand" size="xs">
              {challengeCategory}
            </Tag>
          )}
          <Tag tone={statusTone} size="xs">
            {statusLabel}
          </Tag>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500">
          <Icon name="Target" size={13} className="text-main-800" />
          <Text size="caption2" weight="medium" className="text-gray-500">
            {challengeType}
            {isIndividual ? '' : ` · ${currentUserCount}/${maxUserCount}`}
          </Text>
        </div>

        <div className="hidden items-center gap-1.5 text-gray-400 sm:flex">
          <Icon name="Calendar" size={12} />
          <Text size="caption3" weight="regular" className="text-gray-400">
            {dateLabel}
          </Text>
        </div>
      </div>
    </Card>
  );
}
