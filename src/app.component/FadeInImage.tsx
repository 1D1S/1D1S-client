'use client';

import { cn } from '@module/utils/cn';
import Image, { type ImageProps } from 'next/image';
import React, { useCallback, useState } from 'react';

/**
 * next/image 래퍼. 이미지가 디코드되면 opacity 0 → 1 로 부드럽게 페이드인해
 * 스켈레톤/placeholder 배경(bg-*) 위에서 이미지가 "툭" 튀어나오는 현상을
 * 막는다. opacity 트랜지션만 사용하므로 GPU 합성으로 처리돼 끊김이 없다.
 *
 * Safari·캐시 대응: 캐시된 이미지는 React 가 onLoad 핸들러를 붙이기 전에
 * 이미 디코드가 끝나 onLoad 이벤트가 오지 않을 수 있다. ref 콜백에서
 * img.complete 를 확인해 opacity 0 에 영구히 갇히는 것을 방지한다.
 *
 * 떨림 방지: 페이드가 끝나며 합성 레이어가 해제될 때 이미지가 서브픽셀
 * 단위로 살짝 튀는 떨림이 있어, translateZ(0)/backface-hidden 으로 레이어를
 * 고정해 등장 직후의 미세한 떨림을 없앤다.
 *
 * 로드 실패 대응: URL 만료·삭제·네트워크 오류로 로드가 실패하면 onLoad
 * 가 오지 않아 opacity 0 에 영구히 갇혀 "로딩 중"과 구분되지 않는 빈
 * 이미지로 남는다. fallbackSrc 가 있으면 1회 그 이미지로 교체하고,
 * 없으면 페이드인만 끝내 부모 placeholder 배경이 드러나게 한다.
 */
// 이미 한 번 디코드가 끝난 이미지 src(문자열 URL) 를 기억한다. 스크롤·
// 리스트 리렌더 등으로 카드가 재마운트될 때 캐시에 있으면 페이드 없이
// 즉시 opacity-100 으로 그려, 매 재마운트마다 깜빡이던 문제를 없앤다.
// 최초 로드에서만 페이드인이 보인다.
const loadedSrcCache = new Set<string>();

function stringSrc(src: ImageProps['src']): string | null {
  return typeof src === 'string' ? src : null;
}

function isSrcCached(src: ImageProps['src']): boolean {
  const key = stringSrc(src);
  return key !== null && loadedSrcCache.has(key);
}

type FadeInImageProps = ImageProps & {
  /** 로드 실패 시 1회 교체할 대체 이미지. 미지정 시 교체하지 않는다. */
  fallbackSrc?: ImageProps['src'];
};

function FadeInImage({
  alt,
  className,
  onLoad,
  onError,
  src,
  fallbackSrc,
  ...rest
}: FadeInImageProps): React.ReactElement {
  // 이미 로드된 적 있는 src 면 처음부터 opacity-100 (페이드·깜빡임 없음).
  const [loaded, setLoaded] = useState(() => isSrcCached(src));
  const [errored, setErrored] = useState(false);
  // src 가 바뀌면(다른 이미지로 교체) 로드/에러 상태를 초기화한다. 단
  // 이미 캐시된 src 로 바뀌면 즉시 표시해 깜빡임을 막는다.
  const [trackedSrc, setTrackedSrc] = useState(src);
  if (trackedSrc !== src) {
    setTrackedSrc(src);
    setLoaded(isSrcCached(src));
    setErrored(false);
  }

  const markLoaded = useCallback((loadedSrc: ImageProps['src']) => {
    const key = stringSrc(loadedSrc);
    if (key !== null) {
      loadedSrcCache.add(key);
    }
    setLoaded(true);
  }, []);

  const setRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete) {
        markLoaded(src);
      }
    },
    [markLoaded, src]
  );

  const resolvedSrc = errored && fallbackSrc ? fallbackSrc : src;

  return (
    <Image
      ref={setRef}
      alt={alt}
      src={resolvedSrc}
      className={cn(
        'transition-opacity duration-700 ease-out',
        'motion-reduce:transition-none',
        '[transform:translateZ(0)] [backface-visibility:hidden]',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={(event) => {
        markLoaded(resolvedSrc);
        onLoad?.(event);
      }}
      onError={(event) => {
        // fallbackSrc 로 1회만 교체(무한 루프 방지). fallback 까지
        // 실패하면 더 바꾸지 않고 부모 배경이 보이도록 둔다.
        if (fallbackSrc && !errored) {
          setErrored(true);
          setLoaded(false);
        }
        onError?.(event);
      }}
      {...rest}
    />
  );
}

export default FadeInImage;
