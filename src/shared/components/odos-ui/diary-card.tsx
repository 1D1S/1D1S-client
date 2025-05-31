'use client';

import React from 'react';
import Image from 'next/image';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosButton } from './button';
import { CircularProgress } from './circular-progress';

interface ImageSectionProps {
  imageUrl?: string;
  alt: string;
  likes: number;
  onClick?(): void;
}

export function ImageSection({
  imageUrl,
  alt,
  likes,
  onClick,
}: ImageSectionProps): React.ReactElement {
  return (
    <div className="relative mb-4 h-[250px] w-[200px] overflow-hidden rounded-xl">
      <Image
        src={imageUrl ?? '/images/default-card.png'}
        alt={alt}
        width={200}
        height={250}
        className="object-cover"
        onError={(e) => {
          e.currentTarget.src = '/images/default-card.png';
        }}
      />

      {/* 왼쪽 위에 원형 Progress 표시 */}
      <div className="absolute top-2 left-2 z-20">
        <CircularProgress value={60} size="lg" strokeWidthVariant="thick" />
      </div>

      <div className="absolute top-2 right-2 z-20">
        <OdosLabel
          size="caption2"
          weight="medium"
          className="rounded-md bg-black/50 px-2 py-1 text-white"
        >
          NEW
        </OdosLabel>
      </div>

      <div className="absolute bottom-2 left-2 z-20">
        <OdosButton
          variant="defaultSmall"
          onClick={() => console.log('tooltip 클릭됨')}
          className="pr-2 pl-2"
        >
          <OdosLabel weight="light" size="caption3" onClick={onClick}>
            {likes}
          </OdosLabel>
        </OdosButton>
      </div>
    </div>
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
}: DiaryCardProps): React.ReactElement {
  return (
    <div>
      <ImageSection
        imageUrl={imageUrl}
        alt={title}
        likes={likes}
        onClick={() => console.log('좋아요!')}
      />

      <OdosLabel size="body1" weight="bold" className="block">
        {title}
      </OdosLabel>

      <div className="mb-1 flex items-center text-sm text-gray-500">
        <span>{user}</span>
        <a href={challengeUrl} className="ml-2 text-green-600 hover:underline">
          {challengeLabel}
        </a>
      </div>

      <p className="text-sm text-gray-400">{date}</p>
    </div>
  );
}
