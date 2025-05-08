import { cn } from '@/lib/utils';
import Image from 'next/image';
import { OdosLabel } from './label';
import { OdosTag } from './tag';
import logo from '/public/images/logo.png';

interface ChallengeProps {
  challengeTitle: string;
  challengeType: string;
  currentUserCount: number;
  maxUserCount: number;
  startDate: string;
  endDate: string;
  isOngoing: boolean;
  className?: string;
}

export function OdosChallengeCard({
  challengeTitle,
  challengeType,
  currentUserCount,
  maxUserCount,
  startDate,
  endDate,
  isOngoing = false,
  className,
}: ChallengeProps): React.ReactElement {
  return (
    <div className="hover:rounded-odos-2 hover:shadow-odos-default w-min hover:bg-white hover:px-2 hover:py-4">
      <div className={cn('flex w-50 flex-wrap items-start justify-between gap-y-2', className)}>
        <OdosLabel size="body1" weight="bold" className="text-black">
          {challengeTitle}
        </OdosLabel>
        <div className="rounded-odos-1 bg-main-200 relative h-37.5 w-50">
          <div className="absolute flex flex-row gap-1.5 pt-1 pl-1">
            <OdosTag icon="💻">개발</OdosTag>
            {isOngoing && <OdosTag className="bg-mint-700">진행중</OdosTag>}
            {!isOngoing && <OdosTag className="bg-blue-500">모집중</OdosTag>}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src={logo} alt="로고" width="48" />
          </div>
        </div>
        <OdosLabel size="caption3" weight="bold">
          {challengeType}
        </OdosLabel>
        <div className="flex flex-row gap-1">
          <Image src="/images/user.png" alt="유저" width="12" height="12" />
          <OdosLabel size="caption2" weight="medium">
            {currentUserCount} / {maxUserCount}
          </OdosLabel>
        </div>
        <OdosLabel size="caption3" weight="medium">
          {startDate} - {endDate}
        </OdosLabel>
      </div>
    </div>
  );
}
