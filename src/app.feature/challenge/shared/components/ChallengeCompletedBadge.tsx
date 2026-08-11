import { cn } from '@module/utils/cn';
import { CircleCheck } from 'lucide-react';
import React from 'react';

interface ChallengeCompletedBadgeProps {
  /** 배지 문구 — 본인 완료를 강조할 때 "내 완료" 등으로 바꾼다. */
  label?: string;
  className?: string;
}

/**
 * 챌린지 완료 딱지.
 *
 * 노출 판단은 전적으로 서버가 한다 — "종료된 기한제 + 목표 70% 달성"일 때만
 * true 로 내려온다. 웹은 boolean 을 그대로 믿고 on/off 만 하고 기간·목표율을
 * 다시 계산하지 않는다. 판정 규칙이 두 곳으로 갈라지면 반드시 어긋난다.
 */
export function ChallengeCompletedBadge({
  label = '완료',
  className,
}: ChallengeCompletedBadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full',
        'bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold',
        'whitespace-nowrap text-emerald-700',
        className
      )}
    >
      <CircleCheck className="h-3 w-3 shrink-0" aria-hidden />
      {label}
    </span>
  );
}
