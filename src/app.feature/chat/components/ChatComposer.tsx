'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import { ArrowUp, BookOpen, Flag, Plus, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';

import { ChatShareResolution } from '../type/chat';

/** 서버 @Size(max = 2000). */
const MAX_LENGTH = 2000;

function ImageAttachment({
  file,
  onRemove,
}: {
  file: File;
  onRemove(): void;
}): React.ReactElement {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <div className="relative w-[72px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- 로컬 blob 미리보기. */}
      <img
        src={url}
        alt="보낼 사진"
        className="h-[72px] w-[72px] rounded-[10px] object-cover"
      />
      <button
        type="button"
        aria-label="사진 빼기"
        onClick={onRemove}
        className={cn(
          'absolute -top-1.5 -right-1.5 flex h-5.5 w-5.5 items-center',
          'justify-center rounded-full bg-gray-800 text-white'
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/** 보내기 전 챌린지·일지 미리보기. 사진 미리보기와 같은 자리·같은 빼기 버튼. */
function ShareAttachment({
  share,
  onRemove,
}: {
  share: ChatShareResolution;
  onRemove(): void;
}): React.ReactElement {
  const isDiary = share.type === 'DIARY_SHARE';
  const TypeIcon = isDiary ? BookOpen : Flag;
  const url = resolveDiaryImageUrl(share.share?.thumbnailUrl);
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-gray-100 p-2">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center',
          'overflow-hidden rounded-lg bg-white'
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- S3 호스트 가변.
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <TypeIcon className="h-4 w-4 text-gray-500" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Text size="caption4" weight="extrabold" className="text-main-700">
          {isDiary ? '일지' : '챌린지'}
        </Text>
        <Text size="caption2" weight="bold" className="truncate text-gray-900">
          {share.share?.title ?? ''}
        </Text>
      </div>
      <button
        type="button"
        aria-label="공유 빼기"
        onClick={onRemove}
        className="flex h-6 w-6 shrink-0 items-center justify-center"
      >
        <X className="h-3.5 w-3.5 text-gray-600" />
      </button>
    </div>
  );
}

interface ChatComposerProps {
  value: string;
  onChange(value: string): void;
  /** 방·멤버십이 ACTIVE 이고 보관되지 않았을 때만 열린다. */
  enabled: boolean;
  /** 잠긴 이유를 입력창이 직접 말한다(읽기 전용 / 보관). */
  disabledPlaceholder?: string;
  sending: boolean;
  imageFile: File | null;
  share: ChatShareResolution | null;
  onRemoveAttachment(): void;
  onOpenShareMenu(): void;
  onSend(): void;
}

export function ChatComposer({
  value,
  onChange,
  enabled,
  disabledPlaceholder = '읽기 전용 채팅방입니다',
  sending,
  imageFile,
  share,
  onRemoveAttachment,
  onOpenShareMenu,
  onSend,
}: ChatComposerProps): React.ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 입력 높이를 내용에 맞춘다(최대 5줄). scrollHeight 는 렌더 후에만
  // 정확하므로 값이 바뀔 때마다 다시 잰다.
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) {
      return;
    }
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 120)}px`;
  }, [value]);

  // 사진만, 캡션만, 둘 다 — 셋 다 보낼 수 있다.
  const hasContent = Boolean(value.trim() || imageFile || share);
  const canSend = enabled && !sending && hasContent;

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-2">
      {imageFile ? (
        <div className="pb-2">
          <ImageAttachment file={imageFile} onRemove={onRemoveAttachment} />
        </div>
      ) : share ? (
        <div className="pb-2">
          <ShareAttachment share={share} onRemove={onRemoveAttachment} />
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <button
          type="button"
          aria-label="보낼 것 고르기"
          disabled={!enabled}
          onClick={onOpenShareMenu}
          className={cn(
            'flex h-10 w-9 shrink-0 items-center justify-center',
            enabled ? 'text-gray-700' : 'text-gray-400'
          )}
        >
          <Plus className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          disabled={!enabled}
          rows={1}
          maxLength={MAX_LENGTH}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            // 데스크톱에서는 Enter 로 보내고 Shift+Enter 로 줄바꿈한다.
            // 모바일 IME 조합 중 Enter 는 확정이므로 보내지 않는다.
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              if (canSend) {
                onSend();
              }
            }
          }}
          placeholder={enabled ? '메시지를 입력하세요' : disabledPlaceholder}
          className={cn(
            'max-h-[120px] min-h-10 flex-1 resize-none rounded-[20px]',
            'bg-gray-100 px-3.5 py-2.5 leading-normal text-gray-900',
            'placeholder:text-gray-500 focus:outline-none',
            'disabled:cursor-not-allowed'
          )}
        />

        <button
          type="button"
          aria-label="보내기"
          disabled={!canSend}
          onClick={onSend}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center',
            'rounded-full text-white transition-colors',
            canSend ? 'bg-main-600' : 'bg-gray-300'
          )}
        >
          <ArrowUp className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
