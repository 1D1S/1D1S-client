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
 */
type FadeInImageProps = ImageProps;

function FadeInImage({
  alt,
  className,
  onLoad,
  ...rest
}: FadeInImageProps): React.ReactElement {
  const [loaded, setLoaded] = useState(false);

  const setRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <Image
      ref={setRef}
      alt={alt}
      className={cn(
        'transition-opacity duration-700 ease-out',
        'motion-reduce:transition-none',
        '[transform:translateZ(0)] [backface-visibility:hidden]',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      {...rest}
    />
  );
}

export default FadeInImage;
