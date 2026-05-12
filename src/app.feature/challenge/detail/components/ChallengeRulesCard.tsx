'use client';

import { Button, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

interface ChallengeRulesCardProps {
  goals: string[];
  isFreeChallenge: boolean;
  editLabel?: string;
  onEdit?(): void;
}

export function ChallengeRulesCard({
  goals,
  isFreeChallenge,
  editLabel,
  onEdit,
}: ChallengeRulesCardProps): React.ReactElement {
  return (
    <section
      className={cn(
        'rounded-[14px] border border-gray-100 bg-gray-50',
        'lg:border-gray-200 lg:bg-white',
        'p-4 sm:p-5 lg:p-6'
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <Text
          as="h2"
          size="heading2"
          weight="extrabold"
          className="tracking-[-0.3px] text-gray-900"
        >
          인증 규칙
        </Text>
        {editLabel && onEdit ? (
          <Button variant="outlined" size="small" onClick={onEdit}>
            {editLabel}
          </Button>
        ) : null}
      </div>

      {isFreeChallenge ? (
        <Text
          size="body2"
          weight="regular"
          as="p"
          className="block leading-7 text-gray-500"
        >
          자유 목표 챌린지입니다.
          <br />
          참여 신청 시 나만의 목표를 직접 입력할 수 있습니다.
        </Text>
      ) : goals.length === 0 ? (
        <Text
          size="body2"
          weight="regular"
          as="p"
          className="block text-gray-500"
        >
          등록된 목표가 없습니다.
        </Text>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {goals.map((goal, index) => (
            <li
              key={`${goal}-${index}`}
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
                {goal}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
