'use client';

import React, { ReactElement } from 'react';
import Image from 'next/image';
import { Card } from '@/shared/components/ui/card';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { cn } from '@/shared/lib/utils';

interface LikeButtonProps {
  likes: number;
  onClick?(): void;
}

export function LikeButton({ likes, onClick }: LikeButtonProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center',
        'self-start',
        'bg-main-900 p-2',
        'cursor-pointer hover:bg-red-500',
        'transition-colors duration-150'
      )}
    >
      <OdosLabel size="caption2" weight="medium" className="ml-1 flex-none text-white">
        {likes}
      </OdosLabel>
    </button>
  );
}

export interface DiaryCardProps {
  imageUrl?: string;
  percent: number;
  status: string;
  emoji: string;
  likes: number;
  title: string;
  user: string;
  challengeLabel: string;
  challengeUrl: string;
  date: string;
}

export function DiaryCard({
  imageUrl,
  likes,
  title,
  user,
  challengeLabel,
  challengeUrl,
  date,
}: DiaryCardProps): ReactElement {
  return (
    <Card className="w-64 rounded-2xl bg-white p-6">
      <Image
        width={200}
        height={250}
        src={imageUrl ?? '/images/default-card.png'}
        alt={title}
        className="mb-4 h-64 w-full rounded-xl object-cover"
        onError={(image) => {
          image.currentTarget.src = '/images/default-card.png';
        }}
      />

      <OdosLabel size="body1" weight="bold">
        {title}
      </OdosLabel>

      <LikeButton likes={likes}></LikeButton>

      <div className="mb-1 flex items-center text-sm text-gray-500">
        <span>{user}</span>
        <a href={challengeUrl} className="ml-2 text-green-600 hover:underline">
          {challengeLabel}
        </a>
      </div>

      <p className="text-sm text-gray-400">{date}</p>
    </Card>
  );
}
