import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import {
  Calendar,
  Camera,
  Clock,
  type LucideIcon,
  PenLine,
  Target,
  Users,
} from 'lucide-react';
import React from 'react';

import { POST_END_WRITE_GRACE_DAYS } from '../../board/utils/challengePeriod';

interface ChallengeInfoCardProps {
  dateRangeText: string;
  participantsLabel: string;
  typeLabel: string;
  isGroup: boolean;
  // 서버 스키마상 optional — 기존 truthiness 동작 그대로 보존(undefined=falsy).
  photoRequired: boolean | undefined;
  allowMidJoin: boolean;
  postEndWriteAllowed: boolean | undefined;
}

// 소개 탭 하단 "챌린지 정보" — 히어로/진행률과 겹치지 않는 규칙·옵션 위주.
// ChallengeDetailScreen 에서 분리한 프레젠테이션 블록(마크업/클래스 불변).
export function ChallengeInfoCard({
  dateRangeText,
  participantsLabel,
  typeLabel,
  isGroup,
  photoRequired,
  allowMidJoin,
  postEndWriteAllowed,
}: ChallengeInfoCardProps): React.ReactElement {
  const infoRows: Array<{ label: string; value: string; icon: LucideIcon }> = [
    { label: '기간', value: dateRangeText, icon: Calendar },
    { label: '인원', value: participantsLabel, icon: Users },
    {
      label: '방식',
      value: `${typeLabel} 목표 · ${isGroup ? '단체' : '개인'}`,
      icon: Target,
    },
    {
      label: '인증샷',
      value: photoRequired ? '필수' : '자유',
      icon: Camera,
    },
    {
      label: '중도 참여',
      value: allowMidJoin ? '가능' : '불가',
      icon: Clock,
    },
  ];

  return (
    <section
      className={cn(
        'rounded-[14px] border border-gray-200 bg-white',
        'p-4 sm:p-5 lg:p-6'
      )}
    >
      <Text
        as="h2"
        size="heading2"
        weight="extrabold"
        className="mb-3 block tracking-[-0.3px] text-gray-900"
      >
        챌린지 정보
      </Text>
      <div className={cn('grid grid-cols-1 gap-1.5 sm:grid-cols-2')}>
        {infoRows.map((row) => (
          <div
            key={row.label}
            className={cn(
              'flex items-center gap-2.5 rounded-[10px]',
              'bg-gray-50 px-3.5 py-2.5'
            )}
          >
            <row.icon
              className="size-4 shrink-0 text-gray-400"
              strokeWidth={2}
              aria-hidden
            />
            <Text
              size="caption1"
              weight="medium"
              className={cn('shrink-0 whitespace-nowrap text-gray-600')}
            >
              {row.label}
            </Text>
            <Text
              size="caption1"
              weight="semibold"
              className={cn('min-w-0 flex-1 truncate text-right', 'text-gray-900')}
            >
              {row.value}
            </Text>
          </div>
        ))}
      </div>
      {postEndWriteAllowed ? (
        <div
          className={cn(
            'border-main-300 bg-main-100 mt-2 flex',
            'items-center gap-2.5 rounded-[10px] border',
            'px-3.5 py-3'
          )}
        >
          <PenLine
            className="text-main-800 size-4 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
          <Text size="caption1" weight="bold" className="text-gray-700">
            종료 후{' '}
            <b className="text-main-800">{POST_END_WRITE_GRACE_DAYS}일</b>
            까지 일지 작성 가능
          </Text>
        </div>
      ) : null}
    </section>
  );
}
