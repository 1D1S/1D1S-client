'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosButton } from './button';
import { CircularProgress } from './circular-progress';
import { cn } from '@/shared/lib/utils';
import { OdosCircleAvatar } from './circle-avatar';
import Link from 'next/link';

type Emotion = 'happy' | 'soso' | 'sad';

interface ImageSectionProps {
  imageUrl?: string;
  alt: string;
  emotion: Emotion;
  percent: number;
  isLiked: boolean;
  likeCount: number;
  onToggleLike(): void;
}

function ImageSection({
  imageUrl,
  alt,
  percent,
  emotion,
  isLiked,
  likeCount,
  onToggleLike,
}: ImageSectionProps): React.ReactElement {
  const emotionImageMap: Record<Emotion, string> = {
    happy: '/images/emotion-happy.png',
    soso: '/images/emotion-soso.png',
    sad: '/images/emotion-sad.png',
  };

  return (
    <div className="rounded-odos-2 relative h-[250px] w-[200px] overflow-hidden">
      {/* 배경 이미지 */}
      <Image
        src={imageUrl ?? '/images/default-card.png'}
        alt={alt}
        fill
        className="object-cover"
        onError={(error) => {
          error.currentTarget.src = '/images/default-card.png';
        }}
      />

      {/* 달성 퍼센티지 */}
      <div className="absolute top-2 left-2 z-20">
        <div className={cn('flex items-center space-x-2', 'bg-main-200/80 rounded-odos-2 p-1')}>
          <CircularProgress value={percent} size="sm" color="red" showPercentage={false} />
          <div className="flex h-7.5 flex-col justify-between">
            <OdosLabel size="caption1" weight="bold" className="text-main-900">
              {percent}%
            </OdosLabel>
            <OdosLabel size="caption3" weight="medium" className="text-gray-700">
              달성
            </OdosLabel>
          </div>
        </div>
      </div>

      {/* 감정 이미지 */}
      <div className="absolute top-2 right-2 z-20">
        <Image src={emotionImageMap[emotion]} alt={emotion} width={30} height={30} />
      </div>

      {/* 좋아요 토글 */}
      <div className="absolute bottom-2 left-2 z-20">
        <OdosButton variant="defaultSmall" onClick={onToggleLike} className="pr-2 pl-2">
          <div className="flex flex-row items-center space-x-1">
            <Image
              width={10}
              height={9}
              alt="heart"
              src={isLiked ? '/images/heart-filled.png' : '/images/heart-outlined.png'}
            />
            <OdosLabel weight="light" size="caption3">
              {likeCount}
            </OdosLabel>
          </div>
        </OdosButton>
      </div>
    </div>
  );
}

interface TextSectionProps {
  title: string;
  user: string;
  userImage?: string;
  challengeLabel: string;
  challengeUrl: string;
  date: string;
}

function TextSection({
  title,
  user,
  userImage,
  challengeLabel,
  challengeUrl,
  date,
}: TextSectionProps): React.ReactElement {
  return (
    <div className="mt-2 flex w-full flex-col">
      <OdosLabel size="body1" weight="bold" className="truncate">
        {title}
      </OdosLabel>

      <div className="mt-1 flex items-center">
        <OdosCircleAvatar imageUrl={userImage} size="sm" />
        <div className="ml-2 flex h-10 flex-col justify-between">
          <OdosLabel size="caption3" weight="medium">
            {user}
          </OdosLabel>
          <Link href={challengeUrl} className="m-0 p-0 no-underline">
            <OdosLabel size="caption3" weight="medium" className="text-mint-900">
              {challengeLabel}
            </OdosLabel>
          </Link>
        </div>
      </div>
      <OdosLabel size="caption3" weight="medium" className="mt-2 text-gray-900">
        {date}
      </OdosLabel>
    </div>
  );
}

export interface DiaryCardProps {
  imageUrl?: string;
  percent: number;
  likes: number;
  title: string;
  user: string;
  userImage?: string;
  challengeLabel: string;
  challengeUrl: string;
  date: string;
  emotion: Emotion;
}

export function DiaryCard({
  imageUrl,
  percent,
  likes,
  title,
  user,
  userImage,
  challengeLabel,
  challengeUrl,
  date,
  emotion = 'happy',
}: DiaryCardProps): React.ReactElement {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(likes);

  const handleToggleLike = (): void => {
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked((prev) => !prev);
  };

  return (
    <div className="w-[216px]">
      <div className="rounded-odos-2 transform p-2 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
        <ImageSection
          imageUrl={imageUrl}
          alt={title}
          percent={percent}
          emotion={emotion}
          isLiked={isLiked}
          likeCount={likeCount}
          onToggleLike={handleToggleLike}
        />

        <TextSection
          title={title}
          user={user}
          userImage={userImage}
          challengeLabel={challengeLabel}
          challengeUrl={challengeUrl}
          date={date}
        />
      </div>
    </div>
  );
}
