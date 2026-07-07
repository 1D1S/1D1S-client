'use client';

import { cn } from '@module/utils/cn';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const FALLBACK_IMAGE = '/images/default-card.png';

// 로드 실패 시 1회만 대체 이미지로 교체(무한 onError 루프 방지).
function handleThumbnailError(
  event: React.SyntheticEvent<HTMLImageElement>
): void {
  const img = event.currentTarget;
  if (img.src.endsWith(FALLBACK_IMAGE)) {
    return;
  }
  img.src = FALLBACK_IMAGE;
}

interface DiaryImageGalleryProps {
  /** 표시할 이미지 URL 목록 (0장이면 렌더하지 않음) */
  imageUrls: string[];
}

/**
 * 일지 상세 하단 이미지 갤러리.
 * 정사각형 썸네일을 나열하고, 클릭 시 라이트박스로 원본을 본다.
 * 다중 이미지를 고려한 인터페이스 — 2장 이상이면 이전/다음 이동과
 * 카운터를 노출한다.
 */
export function DiaryImageGallery({
  imageUrls,
}: DiaryImageGalleryProps): React.ReactElement | null {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const count = imageUrls.length;

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(
    () =>
      setOpenIndex((index) =>
        index === null ? index : (index - 1 + count) % count
      ),
    [count]
  );
  const showNext = useCallback(
    () =>
      setOpenIndex((index) => (index === null ? index : (index + 1) % count)),
    [count]
  );

  useEffect(() => {
    if (openIndex === null) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        close();
      } else if (event.key === 'ArrowLeft') {
        showPrev();
      } else if (event.key === 'ArrowRight') {
        showNext();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openIndex, close, showPrev, showNext]);

  if (count === 0) {
    return null;
  }

  const hasMultiple = count > 1;

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {imageUrls.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            aria-label={`이미지 ${index + 1} 크게 보기`}
            onClick={() => setOpenIndex(index)}
            className={cn(
              'aspect-square w-[200px] max-w-full cursor-zoom-in',
              'overflow-hidden rounded-xl border border-gray-200 bg-gray-100'
            )}
          >
            {/* 썸네일은 페이드 없이 즉시 표시 — FadeInImage 의 opacity
                0→1 페이드가 새로고침마다 깜빡임으로 보이던 문제 회피. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`일지 이미지 ${index + 1}`}
              className="h-full w-full object-cover"
              onError={handleThumbnailError}
            />
          </button>
        ))}
      </div>

      {openIndex !== null && typeof document !== 'undefined'
        ? createPortal(
            // detail-fade-in 래퍼의 stacking context/containing block 을
            // 벗어나 사이드바 위에 뷰포트 기준으로 뜨도록 body 로 포탈.
            <div
              className={cn(
                'fixed inset-0 z-[100] flex items-center justify-center',
                'bg-black/80 p-4'
              )}
              onClick={close}
              role="presentation"
            >
              <button
                type="button"
                aria-label="닫기"
                className={cn(
                  'absolute top-4 right-4 flex h-9 w-9 items-center',
                  'justify-center rounded-full bg-white/10 text-white',
                  'transition-colors hover:bg-white/20'
                )}
                onClick={close}
              >
                <X className="h-5 w-5" />
              </button>

              {hasMultiple ? (
                <button
                  type="button"
                  aria-label="이전 이미지"
                  className={cn(
                    'absolute left-4 flex h-10 w-10 items-center',
                    'justify-center rounded-full bg-white/10 text-white',
                    'transition-colors hover:bg-white/20'
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrev();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              ) : null}

              {/* unoptimized 전역 설정이라 next/image 이점이 없고, 원본을
                  뷰포트에 맞춰 축소만 하면 되므로 평범한 img 사용. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrls[openIndex]}
                alt={`일지 이미지 ${openIndex + 1}`}
                className={cn(
                  'max-h-[80vh] max-w-[min(90vw,720px)]',
                  'rounded-xl object-contain'
                )}
                onClick={(event) => event.stopPropagation()}
              />

              {hasMultiple ? (
                <button
                  type="button"
                  aria-label="다음 이미지"
                  className={cn(
                    'absolute right-4 flex h-10 w-10 items-center',
                    'justify-center rounded-full bg-white/10 text-white',
                    'transition-colors hover:bg-white/20'
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    showNext();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              ) : null}

              {hasMultiple ? (
                <div
                  className={cn(
                    'absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full',
                    'bg-black/50 px-3 py-1 text-xs font-medium text-white'
                  )}
                >
                  {openIndex + 1} / {count}
                </div>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
