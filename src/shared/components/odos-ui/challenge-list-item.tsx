'use client';

import Image from 'next/image';
import { OdosLabel } from './label';
import { OdosTag } from './tag';
import { cn } from '@/shared/lib/utils';

interface ChallengeListItemProps {
  challengeName: string;
  challengeImageUrl?: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  onClick?(): void;
  className?: string;
}

export function ChallengeListItem({
  challengeName,
  challengeImageUrl,
  startDate,
  endDate,
  maxParticipants,
  currentParticipants,
  onClick = () => {},
  className = '',
}: ChallengeListItemProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex h-20 w-full items-center',
        'gap-4 p-2.5',
        'cursor-pointer rounded-lg transition-shadow duration-200 ease-in-out',
        'hover:shadow-odos-default',
        className
      )}
      onClick={onClick}
    >
      {/* 썸네일 이미지 */}
      <Image
        width={60}
        height={60}
        src={challengeImageUrl ? challengeImageUrl : '/images/default-item.png'}
        alt={challengeName}
        className="h-15 w-15 rounded-lg object-cover"
      />

      <div className="flex h-15 w-full flex-col justify-between">
        {/* 챌린지 이름과 날짜 */}
        <div className="flex w-full items-center justify-between">
          <OdosLabel size="body1" weight="bold">
            {challengeName}
          </OdosLabel>
          <OdosLabel size="caption3" weight="medium">
            {startDate} - {endDate}
          </OdosLabel>
        </div>
        <div className="flex w-full items-center justify-between">
          {/* 태그 */}
          <div className="flex gap-2">
            <OdosTag icon="💻">태그</OdosTag>
            <OdosTag>태그</OdosTag>
          </div>
          {/* 참여자 수 */}
          <div className="flex gap-2">
            <Image width={12} height={12} src="/images/user.png" alt="icon-user" />
            <OdosLabel size="caption3" weight="medium">
              {currentParticipants} / {maxParticipants}
            </OdosLabel>
          </div>
        </div>
      </div>
    </div>
  );
}
