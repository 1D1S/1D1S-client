import { cn, ImagePlaceholder, Tag, Text } from '@1d1s/design-system';
import { Target, Users } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

export interface ChallengeCardProps {
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

export function ChallengeCard({
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
  isOngoing = false,
  isEnded = false,
  className,
  onClick,
}: ChallengeCardProps): React.ReactElement {
  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);
  const participantLabel =
    maxUserCount <= 1 ? '개인' : `${currentUserCount} / ${maxUserCount}`;

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
        'm w-full overflow-hidden rounded-[12px] border border-gray-200 bg-white',
        onClick && 'cursor-pointer',
        'transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <div className="relative h-40 w-full overflow-hidden bg-gray-100 sm:h-52">
        {hasImage ? (
          <div className="absolute inset-0">
            <Image
              src={imageUrl as string}
              alt={challengeTitle}
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <ImagePlaceholder className="absolute inset-0" logoSize="lg" />
        )}
        {hasImage ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-linear-to-b from-black/20 to-transparent" />
        ) : null}

        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
          <Tag size="caption2" weight="bold">
            {challengeCategory ?? challengeType}
          </Tag>
          <Tag size="caption2" weight="bold" className={statusClassName}>
            {statusLabel}
          </Tag>
        </div>
      </div>

      <div className="w-full bg-white px-4 py-4 sm:px-5 sm:py-5">
        <Text
          as="p"
          size="body1"
          weight="bold"
          className="line-clamp-2m] leading-snug text-gray-900 sm:min-h-[3rem] sm:text-2xl"
        >
          {challengeTitle}
        </Text>

        <div className="mt-2 flex w-full items-center justify-between sm:mt-3">
          <div className="flex items-center gap-1.5">
            <Target className="h-3 w-3 text-gray-600 sm:h-3.5 sm:w-3.5" />
            <Text
              size="caption2"
              weight="medium"
              className="text-gray-600 sm:text-base"
            >
              {challengeType}
            </Text>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-gray-600 sm:h-3.5 sm:w-3.5" />
            <Text
              size="caption2"
              weight="medium"
              className="text-gray-600 sm:text-base"
            >
              {participantLabel}
            </Text>
          </div>
        </div>

        <Text
          size="caption2"
          weight="regular"
          className="mt-1.5 text-gray-500 sm:mt-2 sm:text-base"
        >
          {dateLabel}
        </Text>
      </div>
    </div>
  );
}
