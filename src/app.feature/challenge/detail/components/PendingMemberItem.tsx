'use client';

import {
  Button,
  CircleAvatar,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tag,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ListChecks } from 'lucide-react';
import React, { useState } from 'react';

interface PendingMemberGoal {
  challengeGoalId: number;
  content: string;
}

interface PendingMemberItemProps {
  name: string;
  joinedAt: string;
  profileImg?: string | null;
  // 신청자가 설정한 목표 — 자유 목표 챌린지일 때만 전달된다(있으면 버튼 노출).
  goals?: PendingMemberGoal[];
  onProfileClick?(): void;
  onAccept(): void;
  onReject(): void;
  isLoading: boolean;
}

export function PendingMemberItem({
  name,
  joinedAt,
  profileImg,
  goals,
  onProfileClick,
  onAccept,
  onReject,
  isLoading,
}: PendingMemberItemProps): React.ReactElement {
  const [goalsOpen, setGoalsOpen] = useState(false);
  const hasGoals = (goals?.length ?? 0) > 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl',
        'border border-gray-200 bg-white px-3.5 py-3'
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onProfileClick}
          disabled={!onProfileClick}
          aria-label={`${name} 프로필 보기`}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-3 rounded-lg',
            '-mx-1 -my-1 px-1 py-1 text-left transition-colors',
            'hover:bg-gray-50 disabled:cursor-default',
            'disabled:hover:bg-transparent'
          )}
        >
          <CircleAvatar
            size="md"
            imageUrl={profileImg ?? undefined}
            tone="cream"
          />
          <div className="flex min-w-0 flex-col items-start gap-1">
            <Text
              size="body2"
              weight="bold"
              className="max-w-full truncate text-gray-900"
            >
              {name}
            </Text>
            <Tag tone="gray" size="xs">
              {joinedAt}
            </Tag>
          </div>
        </button>

        {hasGoals ? (
          <button
            type="button"
            onClick={() => setGoalsOpen(true)}
            aria-label={`${name}님이 설정한 목표 보기`}
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full',
              'px-2.5 py-1.5 text-[11px] font-bold transition-colors',
              'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
            )}
          >
            <ListChecks className="h-3.5 w-3.5" />
            목표
          </button>
        ) : null}
      </div>

      {/* 좁은 폭(태블릿 2열 등)에서 버튼이 프로필과 겹치지 않도록 아래로 분리. */}
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          pill
          fullWidth
          onClick={onAccept}
          disabled={isLoading}
        >
          수락
        </Button>
        <Button
          variant="secondary"
          size="sm"
          pill
          fullWidth
          onClick={onReject}
          disabled={isLoading}
        >
          거절
        </Button>
      </div>

      <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[420px]">
          <DialogHeader className="flex-col items-start gap-1.5 pb-2">
            <DialogTitle className="text-[17px] font-extrabold tracking-[-0.3px] text-gray-900">
              {`${name}님이 설정한 목표`}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <ul className="flex flex-col gap-1.5">
              {(goals ?? []).map((goal, index) => (
                <li
                  key={goal.challengeGoalId}
                  className={cn(
                    'flex items-start gap-2.5 rounded-[10px]',
                    'border border-gray-100 bg-white px-3.5 py-2.5',
                    'lg:bg-gray-50'
                  )}
                >
                  <Text
                    size="body2"
                    weight="extrabold"
                    className="text-main-800"
                  >
                    {index + 1}.
                  </Text>
                  <Text
                    size="body2"
                    weight="medium"
                    className="flex-1 break-keep text-gray-700"
                  >
                    {goal.content}
                  </Text>
                </li>
              ))}
            </ul>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
