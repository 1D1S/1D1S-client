'use client';

import { Banner } from '@1d1s/design-system';
import {
  HOME_MAIN_BANNERS,
  type HomeMainBanner,
} from '@constants/consts/homeData';
import { cn } from '@module/utils/cn';
import { BarChart3 } from 'lucide-react';
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
        onClick={() => current.href && router.push(current.href)}
        className={cn(
          'shadow-warm h-full cursor-pointer transition',
          'data-fade-in hover:brightness-105'
        )}
      />
      {/* 통계 보기 바로가기 — 배너 자체 이동과 겹치지 않게 전파 차단. */}
      <button
        type="button"
        aria-label="내 통계 보기"
        onClick={(event) => {
          event.stopPropagation();
          router.push('/mypage/statistics');
        }}
        className={cn(
          'absolute top-3 right-4 inline-flex items-center gap-1',
          'rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold',
          'text-white backdrop-blur transition hover:bg-white/30'
        )}
      >
        <BarChart3 className="h-3.5 w-3.5" />
        통계 보기
      </button>
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
