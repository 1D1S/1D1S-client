'use client';

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
    if (current.href) {
      router.push(current.href);
    }
  };

  return (
    <div className="w-full px-5">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'relative h-[160px] w-full overflow-hidden rounded-[18px]',
          'shadow-warm text-left text-white transition',
          'hover:brightness-105'
        )}
      >
        <span
          aria-hidden
          className="animate-float absolute inset-0"
          style={{
            background: current.gradient,
            transform: 'scale(1.1)',
            transition: 'background 0.6s',
          }}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0',
            'bg-gradient-to-t from-black/15 via-transparent to-transparent'
          )}
        />
        <span
          className={cn(
            'absolute top-5 left-5 inline-flex items-center',
            'rounded-full bg-white/30 px-2.5 py-1',
            'text-[11px] font-extrabold tracking-wider text-white',
            'backdrop-blur-sm'
          )}
        >
          {current.kind}
        </span>
        <span
          key={current.id}
          className={cn(
            'absolute right-5 bottom-5 left-5 flex flex-col gap-1.5',
            'animate-fade-up'
          )}
        >
          <span
            className={cn(
              'text-[22px] leading-[1.2] font-extrabold tracking-tight',
              'whitespace-pre-line'
            )}
          >
            {current.title}
          </span>
          <span className="text-[12px] font-medium text-white/95">
            {current.subtitle}
          </span>
        </span>
      </button>
      <div className="mt-3 flex justify-center gap-1.5">
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
                ? 'bg-brand w-5'
                : 'w-1.5 bg-gray-300 hover:bg-gray-400'
            )}
          />
        ))}
      </div>
    </div>
  );
}
