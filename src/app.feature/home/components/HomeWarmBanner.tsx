'use client';

import { Banner } from '@1d1s/design-system';
import {
  HOME_MAIN_BANNERS,
  type HomeMainBanner,
} from '@constants/consts/homeData';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const ROTATION_MS = 5000;

interface HomeWarmBannerProps {
  banners?: HomeMainBanner[];
}

export default function HomeWarmBanner({
  banners = HOME_MAIN_BANNERS,
}: HomeWarmBannerProps): React.ReactElement | null {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) {
      return undefined;
    }
    const timerId = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, ROTATION_MS);
    return () => window.clearInterval(timerId);
  }, [banners.length]);

  if (banners.length === 0) {
    return null;
  }

  const current = banners[index];

  const handleClick = (): void => {
    if (!current.href) {
      return;
    }
    if (/^https?:\/\//.test(current.href)) {
      window.open(current.href, '_blank', 'noopener,noreferrer');
      return;
    }
    router.push(current.href);
  };

  return (
    <div className="relative h-full w-full">
      <Banner
        key={current.id}
        kind={current.kind}
        title={current.title}
        subtitle={current.subtitle}
        bg={current.gradient}
        size="md"
        role="link"
        onClick={handleClick}
        className={cn(
          'shadow-warm h-full cursor-pointer transition',
          'data-fade-in hover:brightness-105'
        )}
      />
      {banners.length > 1 ? (
        <div className="absolute right-4 bottom-3 flex items-center gap-1.5">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`${i + 1}번째 배너로 이동`}
              onClick={(event) => {
                event.stopPropagation();
                setIndex(i);
              }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index
                  ? 'w-4 bg-white'
                  : 'w-1.5 bg-white/50 hover:bg-white/75'
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
