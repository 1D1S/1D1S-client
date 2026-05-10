'use client';

import { Card, Icon, Stripe, Tag } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

export interface ChallengeCardProps {
  title: string;
  category: string;
  imageUrl?: string;
  currentParticipantCount: number;
  maxParticipantCount: number;
  remainingLabel: string;
  onClick?(): void;
  className?: string;
}

export default function ChallengeCard({
  title,
  category,
  imageUrl,
  currentParticipantCount,
  maxParticipantCount,
  remainingLabel,
  onClick,
  className,
}: ChallengeCardProps): React.ReactElement {
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      interactive
      radius="md"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'hover:shadow-[0_10px_28px_rgba(255,87,34,0.18)]',
        className
      )}
    >
      <Card.Thumb className="bg-main-100 h-[110px]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 280px, 50vw"
            className="object-cover"
          />
        ) : (
          <Stripe tone="peach" />
        )}
      </Card.Thumb>
      <Card.Body>
        <div className="flex">
          <Tag tone="brand" size="xs">
            {category}
          </Tag>
        </div>
        <Card.Title className="min-h-[2.6em]">{title}</Card.Title>
        <Card.Meta>
          <span className="inline-flex items-center gap-1">
            <Icon name="People" size={11} />
            {currentParticipantCount}/{maxParticipantCount}
          </span>
          <span className="text-brand font-bold">{remainingLabel}</span>
        </Card.Meta>
      </Card.Body>
    </Card>
  );
}
