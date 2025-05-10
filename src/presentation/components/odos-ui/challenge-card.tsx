import { cn } from '@/presentation/lib/utils';
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

/**
 * OdosChallengeCard
 * 챌린지 카드 컴포넌트 - 제목, 유형, 참여자 수, 기간, 상태(진행중/모집중) 표시
 *
 * @param challengeTitle 챌린지 이름
 * @param challengeType 챌린지 유형
 * @param currentUserCount 현재 참여자 수
 * @param maxUserCount 최대 참여자 수
 * @param startDate 시작일 (YYYY-MM-DD)
 * @param endDate 종료일 (YYYY-MM-DD)
 * @param isOngoing 챌린지 진행 상태 (true: 진행중, false: 모집중)
 *
 * @example 기본 사용 예
 * ```tsx
 * <OdosChallengeCard
 *   challengeTitle="챌린지 제목"
 *   challengeType="고정목표형"
 *   currentUserCount={12}
 *   maxUserCount={20}
 *   startDate="2023-10-01"
 *   endDate="2023-10-31"
 *   isOngoing={true}
 * />
 * ```
 */
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
