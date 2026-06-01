import FadeInImage from '@component/FadeInImage';
import { cn } from '@module/utils/cn';
import React from 'react';

interface DiaryHeroImageProps {
  imageUrl: string;
  title: string;
  onOpen(): void;
}

export function DiaryHeroImage({
  imageUrl,
  title,
  onOpen,
}: DiaryHeroImageProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'relative aspect-[4/5] w-full cursor-zoom-in',
        'overflow-hidden rounded-2xl border border-gray-200 bg-gray-100'
      )}
    >
      <FadeInImage
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 720px"
        className="object-cover"
      />
    </button>
  );
}

interface DiaryImageLightboxProps {
  imageUrl: string;
  onClose(): void;
}

export function DiaryImageLightbox({
  imageUrl,
  onClose,
}: DiaryImageLightboxProps): React.ReactElement {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/80 p-4'
      )}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-full max-w-full"
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <button
          type="button"
          className="absolute -top-10 right-0 text-white/80 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
        <FadeInImage
          src={imageUrl}
          alt="일지 이미지 원본"
          width={0}
          height={0}
          sizes="90vw"
          className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>
    </div>
  );
}
