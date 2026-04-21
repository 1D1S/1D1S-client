import { cn, ImagePlaceholder, Tag, Text } from '@1d1s/design-system';
import { Target } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

export interface ChallengeListItemProps {
  challengeTitle: string;
  challengeType: string;
  challengeCategory?: string;
  challengeIcon?: ReactNode;
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
  const statusClassName = hasEnded
    ? 'bg-gray-500'
    : isOngoing
      ? 'bg-green-500'
      : 'bg-blue-500';
  const dateLabel = isInfiniteChallenge
    ? `${startDate} - 무한!`
    : `${startDate} - ${endDate}`;

  return (
    <div
      className={cn(
        'rounded-4 hover:shadow-default flex gap-3 overflow-hidden border border-gray-200 bg-white p-3 transition-all duration-200 ease-in-out hover:-translate-y-1 sm:gap-4 sm:p-4',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative -mb-3 -ml-3 w-[120px] shrink-0 self-stretch overflow-hidden bg-gray-100 sm:-mt-4 sm:-mb-4 sm:-ml-4 sm:w-[140px]">
        {hasImage ? (
          <Image
            src={imageUrl as string}
            alt={challengeTitle}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" logoSize="sm" />
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Title */}
        <Text
          as="p"
          size="caption1"
          weight="bold"
          className="truncate text-gray-900 sm:text-lg"
        >
          {challengeTitle}
        </Text>

        {/* Category + Status tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag size="caption3" weight="medium">
            {challengeCategory ?? challengeType}
          </Tag>
          <Tag size="caption3" weight="bold" className={statusClassName}>
            {statusLabel}
          </Tag>
        </div>

        {/* Goal type + participant */}
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-gray-400" />
          <Text size="caption3" weight="medium" className="text-gray-500">
            {`${challengeType}`}
            {isIndividual ? '' : ` · ${currentUserCount} / ${maxUserCount}`}
          </Text>
        </div>

        {/* Date */}
        <Text
          size="caption3"
          weight="regular"
          className="hidden text-gray-400 sm:block"
        >
          {dateLabel}
        </Text>
      </div>
    </div>
  );
}
