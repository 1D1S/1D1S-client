'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';

interface OdosCircleAvatarProps {
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// circle-avatar.tsx

export function OdosCircleAvatar({
  imageUrl,
  size = 'md',
  className,
}: OdosCircleAvatarProps): React.ReactElement {
  const sizeClasses: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const defaultProfileSrc = '/images/default-profile.png';
  const [isValidImage, setIsValidImage] = useState(true);

  useEffect(() => {
    setIsValidImage(true);
  }, [imageUrl]);

  const isUrlValid = typeof imageUrl === 'string' && /^(\/|https?:\/\/)/.test(imageUrl);

  return (
    <div className={cn('relative overflow-hidden rounded-full', sizeClasses[size], className)}>
      <Image
        src={!imageUrl || !isUrlValid || !isValidImage ? defaultProfileSrc : imageUrl}
        alt="avatar"
        fill
        className="object-cover"
        onError={() => setIsValidImage(false)}
      />
    </div>
  );
}
