'use client';

import { Banner } from '@1d1s/design-system';
import {
  type HomeMainBanner,
  PINNED_HOME_BANNERS,
} from '@constants/consts/homeData';
import { useBanners } from '@feature/banner/hooks/useBanners';
import { type Banner as ServerBanner } from '@feature/banner/type/banner';
import { cn } from '@module/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const ROTATION_MS = 5000;
// 수평 스와이프로 인정할 최소 이동 거리(px). 세로 스크롤과 충돌하지 않도록
// 수평 이동이 수직 이동보다 커야 넘어간다.
const SWIPE_THRESHOLD_PX = 40;

// 캐러셀이 렌더하는 공통 배너 형태. 하드코딩(그라디언트)·서버(이미지) 배너를
// 모두 이 형태로 정규화해 DS Banner 의 bg(=CSS background)로 넘긴다.
interface CarouselBanner {
  id: string;
  kind?: string;
  title: string;
  subtitle: string;
  bg: string;
  href: string;
}

function fromHomeBanner(banner: HomeMainBanner): CarouselBanner {
  return {
    id: banner.id,
    kind: banner.kind,
    title: banner.title,
    subtitle: banner.subtitle,
    bg: banner.gradient,
    href: banner.href,
  };
}

function fromServerBanner(banner: ServerBanner): CarouselBanner {
  return {
    id: `server-${banner.id}`,
    // 서버 tag → 태그 칩(kind 재사용). null/미지정이면 undefined → 칩 미표시.
    kind: banner.tag ?? undefined,
    title: banner.title,
    subtitle: banner.subtitle,
    // imageUrl → 배경 이미지(cover). DS Banner 는 bg 를 background 로 적용한다.
    bg: `url('${banner.imageUrl}') center/cover no-repeat`,
    href: banner.linkUrl,
  };
}

interface HomeWarmBannerProps {
  /** 항상 캐러셀 맨 뒤에 고정되는 배너(디스코드·사용가이드·통계). */
  pinnedBanners?: HomeMainBanner[];
}

export default function HomeWarmBanner({
  pinnedBanners = PINNED_HOME_BANNERS,
}: HomeWarmBannerProps): React.ReactElement | null {
  const router = useRouter();
  const { data: serverBanners } = useBanners();

  // 최종 목록 = [서버(admin) 배너] + [고정 3개]. 고정 3개는 서버 배너 유무와
  // 무관하게 항상 맨 뒤에 붙는다. 서버 배너가 없으면(빈 배열/로딩/404/에러)
  // 고정 3개만 노출된다. 서버 배너 key 는 `server-*`, 고정은 자체 id 라 충돌 없음.
  const banners: CarouselBanner[] = [
    ...(serverBanners ?? []).map(fromServerBanner),
    ...pinnedBanners.map(fromHomeBanner),
  ];

  const count = banners.length;
  const [index, setIndex] = useState(0);
  // 수동 조작 시 값이 바뀌어 자동 로테이션 타이머를 리셋한다.
  const [resetNonce, setResetNonce] = useState(0);
  // 데이터 소스가 바뀌어 개수가 줄어도 항상 범위 안이 되도록 파생값을 쓴다
  // (effect 로 setState 하지 않아 캐스케이드 렌더가 없다).
  const safeIndex = count > 0 ? ((index % count) + count) % count : 0;

  // 자동 로테이션 — resetNonce 가 바뀌면(수동 조작) 인터벌을 다시 시작해
  // 풀 인터벌부터 카운트한다.
  useEffect(() => {
    if (count <= 1) {
      return undefined;
    }
    const timerId = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, ROTATION_MS);
    return () => window.clearInterval(timerId);
  }, [count, resetNonce]);

  // 수동 이동(화살표·인디케이터·스와이프) — 순환 + 타이머 리셋.
  const goTo = useCallback(
    (target: number): void => {
      if (count === 0) {
        return;
      }
      setIndex(((target % count) + count) % count);
      setResetNonce((n) => n + 1);
    },
    [count]
  );

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (event: React.TouchEvent): void => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event: React.TouchEvent): void => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) {
      return;
    }
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    // 수평 이동이 임계값 이상이고 수직보다 커야 스와이프로 인정(스크롤 보호).
    if (
      Math.abs(deltaX) > SWIPE_THRESHOLD_PX &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      goTo(deltaX < 0 ? safeIndex + 1 : safeIndex - 1);
    }
  };

  if (count === 0) {
    return null;
  }

  const current = banners[safeIndex] ?? banners[0];

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

  const arrowClass = cn(
    'absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center',
    'justify-center rounded-full border-0 bg-black/25 text-white',
    'backdrop-blur transition hover:bg-black/40'
  );

  return (
    // 배너 종횡비 5:2(2.5:1) 고정 — 서버 이미지 배너(cover)와 그라디언트 배너
    // 모두 일관. 모바일은 폭에 맞춰 비율 유지, 폭이 넓은 데스크톱에서는
    // max-h 로 상한을 둬 너무 커지지 않게 한다. self-start 로 grid/flex 부모의
    // stretch 가 비율을 깨지 않게 막는다(내부 Banner 는 h-full 로 채움).
    <div
      className="relative aspect-[5/2] max-h-[240px] w-full self-start"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Banner
        key={current.id}
        kind={current.kind}
        title={current.title}
        subtitle={current.subtitle}
        bg={current.bg}
        size="md"
        role="link"
        onClick={handleClick}
        className={cn(
          'shadow-warm h-full cursor-pointer transition',
          'data-fade-in hover:brightness-105'
        )}
      />

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="이전 배너"
            onClick={(event) => {
              event.stopPropagation();
              goTo(safeIndex - 1);
            }}
            className={cn(arrowClass, 'left-3')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="다음 배너"
            onClick={(event) => {
              event.stopPropagation();
              goTo(safeIndex + 1);
            }}
            className={cn(arrowClass, 'right-3')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute right-4 bottom-3 flex items-center gap-1.5">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`${i + 1}번째 배너로 이동`}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(i);
                }}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === safeIndex
                    ? 'w-4 bg-white'
                    : 'w-1.5 bg-white/50 hover:bg-white/75'
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
