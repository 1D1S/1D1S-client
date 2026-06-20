import {
  Card,
  cn,
  Icon,
  Stripe,
  Tag,
  type TagProps,
  Text,
} from '@1d1s/design-system';
import FadeInImage from '@component/FadeInImage';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import { createActivationKeydownHandler } from '@module/utils/event';

export interface ChallengeListItemProps {
  challengeTitle: string;
  challengeType: string;
  challengeCategory?: string;
  // 이미지가 없을 때 Stripe 위에 보여줄 카테고리 아이콘. 호출부에서
  // <CategoryIcon category={category} /> 를 넘기면 ChallengeCard 와 동일하게
  // 기본 커버에 카테고리가 노출된다.
  categoryIcon?: React.ReactNode;
  imageUrl?: string;
  currentUserCount: number;
  maxUserCount: number;
  startDate: string;
  endDate: string;
  isInfiniteChallenge?: boolean;
  isEarlyEnded?: boolean;
  isOngoing: boolean;
  isEnded?: boolean;
  variant?: 'default' | 'picker';
  // 이미지가 없을 때 Stripe placeholder 색. 호출부에서
  // getCategoryStripeTone(category) 결과를 넘기면 카테고리별 색이 적용된다.
  stripeTone?: string;
  className?: string;
  onClick?(): void;
}

type StatusTone = NonNullable<TagProps['tone']>;

export function ChallengeListItem({
  challengeTitle,
  challengeType,
  challengeCategory,
  categoryIcon,
  imageUrl,
  currentUserCount,
  maxUserCount,
  startDate,
  endDate,
  isInfiniteChallenge = false,
  isEarlyEnded = false,
  isOngoing,
  isEnded = false,
  variant = 'default',
  stripeTone = 'peach',
  className,
  onClick,
}: ChallengeListItemProps): React.ReactElement {
  // 백엔드가 raw 키(예: challenge/xxx.jpg)를 주면 next/image 가 그리지 못해
  // 배경색만 보인다. DiaryCard/StoryRing 과 동일하게 풀 URL 로 변환한다.
  const resolvedImageUrl = resolveDiaryImageUrl(imageUrl) ?? undefined;
  const hasImage = Boolean(resolvedImageUrl);
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
  const isPicker = variant === 'picker';

  return (
    <Card
      interactive={Boolean(onClick)}
      radius="md"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={createActivationKeydownHandler(onClick)}
      className={cn(
        'flex items-center overflow-hidden rounded-[14px]',
        isPicker
          ? 'gap-3 border border-gray-200 p-3 sm:gap-4 sm:p-4'
          : 'gap-3 p-3 sm:gap-4 sm:p-4',
        onClick && 'hover:shadow-warm transition-all duration-200',
        className
      )}
    >
      <div
        className={cn(
          'bg-main-100 relative shrink-0 overflow-hidden rounded-[10px]',
          isPicker
            ? 'h-[72px] w-[124px] sm:h-[80px] sm:w-[138px]'
            : 'aspect-video w-[126px] self-center sm:w-[154px]'
        )}
      >
        {hasImage ? (
          <FadeInImage
            src={resolvedImageUrl as string}
            alt={challengeTitle}
            fill
            sizes={
              isPicker
                ? '(min-width: 640px) 138px, 124px'
                : '(min-width: 640px) 154px, 126px'
            }
            className="object-cover"
          />
        ) : (
          <>
            <Stripe tone={stripeTone} />
            {/* 커버 이미지가 없는 챌린지: ChallengeCard 와 동일하게 카테고리
                아이콘 배지 + 라벨로 "의도된 기본 커버"를 그린다. */}
            <div
              className={cn(
                'pointer-events-none absolute inset-0 z-[1] flex',
                'flex-col items-center justify-center gap-1 text-white'
              )}
            >
              {categoryIcon ? (
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    'bg-white/20 ring-1 ring-white/30',
                    '[&_svg]:!h-4 [&_svg]:!w-4'
                  )}
                >
                  {categoryIcon}
                </span>
              ) : null}
              {challengeCategory ? (
                <span
                  className={cn(
                    'text-[10px] font-bold tracking-tight',
                    'text-white/95 drop-shadow-sm'
                  )}
                >
                  {challengeCategory}
                </span>
              ) : null}
            </div>
          </>
        )}
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          isPicker ? 'justify-between gap-2' : 'justify-between gap-2'
        )}
      >
        <div className="flex min-w-0 flex-col gap-1.5">
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
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Icon name="Target" size={13} className="text-main-800" />
            <Text size="caption2" weight="medium" className="text-gray-500">
              {challengeType}
            </Text>
          </div>

          <div className="flex items-center gap-1.5 text-gray-400">
            <Icon name="Calendar" size={12} />
            <Text size="caption3" weight="regular" className="text-gray-400">
              {dateLabel}
            </Text>
          </div>

          {!isIndividual && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Icon name="People" size={12} />
              <Text size="caption3" weight="regular" className="text-gray-400">
                {currentUserCount}/{maxUserCount}명 참여중
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
