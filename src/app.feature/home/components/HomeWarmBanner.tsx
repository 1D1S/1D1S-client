'use client';

import { Banner } from '@1d1s/design-system';
import {
  type HomeMainBanner,
  PINNED_HOME_BANNERS,
} from '@constants/consts/homeData';
import { useBanners } from '@feature/banner/hooks/useBanners';
import { type Banner as ServerBanner } from '@feature/banner/type/banner';
import { cn } from '@module/utils/cn';
import {
  isNativeTabBackground,
  subscribeNativeTabVisibility,
} from '@module/utils/nativeTabVisibility';
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
    bg:
      'linear-gradient(rgba(17,24,39,.36), rgba(17,24,39,.36)), ' +
      `url('${banner.imageUrl}') center/cover no-repeat`,
    href: banner.linkUrl,
  };
}

// 배너 높이/비율 클래스. 컨테이너별로 다르게 넘긴다:
// - 홈(grid-cols-2, 스트릭 카드와 한 행): 5:2 + max-h-240 + **min-h-0**.
//   배너 래퍼는 grid 자식이라 CSS 기본 min-height:auto(=aspect 로 전이된
//   높이 W*2/5)가 max-height 를 이겨(min>max 규칙) 넓은/태블릿 뷰에서 240 을
//   뚫고 커졌다. min-h-0 으로 그 바닥을 없애야 max-h-240 이 실제로 캡한다.
//   고정 높이(h-[200px] 등)를 쓰면 grid 행/스트릭 카드 관계가 깨져(회귀) 쓰지
//   않고, aspect+max-h+min-h-0 로만 캡한다.
// - 탐색(flex-col, 단독 상단 배너): md+ 고정 높이로 상한(동일하게 min-h-0).
const DEFAULT_HEIGHT_CLASS = 'aspect-[5/2] max-h-[240px] min-h-0';

interface HomeWarmBannerProps {
  /** 항상 캐러셀 맨 뒤에 고정되는 배너(사용가이드·통계). */
  pinnedBanners?: HomeMainBanner[];
  /** 인증/사이드바 확정 전 — 배너 자리를 스켈레톤으로 예약한다. */
  isLoading?: boolean;
  /** 배너 높이/비율 제어 클래스(컨테이너별). 미지정 시 홈 기본값. */
  heightClassName?: string;
}

export default function HomeWarmBanner({
  pinnedBanners = PINNED_HOME_BANNERS,
  isLoading = false,
  heightClassName = DEFAULT_HEIGHT_CLASS,
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
  //
  // 앱 셸에서는 배경 탭일 때 멈춘다. 홈은 탭 다섯 개 중 하나라 사용자가 다른
  // 탭에 있는 동안에도 이 타이머가 5초마다 배너를 갈아 끼우고 있었다. 안드로이드
  // 는 WebView 를 텍스처 레이어로 합성해서, 보이지 않는 문서가 프레임을 하나
  // 그릴 때마다 텍스처가 dirty 가 되고 그게 Flutter 프레임 요청이 된다 —
  // 화면에 바뀐 게 없는데 프레임 루프만 도는 상태다. 셸이 CSS 애니메이션은
  // style 주입으로 멈추지만 setInterval 은 그 방식으로 멈출 수 없어서, 여기서
  // 직접 받는다. 브라우저에는 신호 자체가 없어 종전대로 계속 돈다.
  useEffect(() => {
    if (count <= 1) {
      return undefined;
    }
    let timerId: number | undefined;
    const apply = (background: boolean): void => {
      window.clearInterval(timerId);
      timerId = background
        ? undefined
        : window.setInterval(() => {
            setIndex((i) => (i + 1) % count);
          }, ROTATION_MS);
    };
    apply(isNativeTabBackground());
    const unsubscribe = subscribeNativeTabVisibility(apply);
    return () => {
      window.clearInterval(timerId);
      unsubscribe();
    };
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

  // 홈 로딩 중에는 배너 자리를 같은 종횡비 스켈레톤으로 예약해, 인사말·
  // 스트릭과 함께 로딩 → 콘텐츠로 자연스럽게 전환되게 한다.
  if (isLoading) {
    return (
      <div
        aria-hidden
        className={cn(
          // 실제 배너와 동일한 높이 규칙(컨테이너별 heightClassName).
          'skeleton-pulse rounded-4 w-full self-start bg-gray-100',
          heightClassName
        )}
      />
    );
  }

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
    'absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center',
    'justify-center rounded-full border-0 bg-black/25 text-white',
    'backdrop-blur transition hover:bg-black/40'
  );

  return (
    // 높이/비율은 컨테이너별 heightClassName 으로 제어(홈 기본 5:2+max-h,
    // 탐색은 md+ 고정 높이 상한). self-start 로 부모 grid/flex stretch 방지.
    <div
      className={cn('relative w-full self-start', heightClassName)}
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
          'data-fade-in px-12 hover:brightness-105'
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
            className={cn(arrowClass, 'left-2')}
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
            className={cn(arrowClass, 'right-2')}
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
