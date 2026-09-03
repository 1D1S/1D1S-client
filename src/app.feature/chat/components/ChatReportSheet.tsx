'use client';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTitle,
  Button,
  Text,
  TextArea,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React, { useState } from 'react';

import {
  CHAT_REPORT_REASONS,
  type ChatReportReason,
  type ChatReportRequest,
} from '../type/chat';

/** 서버 @Size(max = 500). */
const DETAIL_MAX = 500;

interface ReportFormProps {
  messageId: number;
  isPending: boolean;
  onCancel(): void;
  onSubmit(messageId: number, data: ChatReportRequest): void;
}

interface ChatReportSheetProps {
  /** 신고할 메시지 id. null 이면 닫혀 있다. */
  messageId: number | null;
  isPending: boolean;
  onOpenChange(open: boolean): void;
  onSubmit(messageId: number, data: ChatReportRequest): void;
}

/**
 * 메시지 신고 시트.
 *
 * 사유는 서버 enum 그대로다. 상세는 선택이지만 **기타 사유일 때만 필수**로
 * 받는다 — "기타" 는 그 자체로 아무것도 설명하지 않아서, 그대로 접수하면
 * 관리자가 판단할 근거가 없다.
 */
function ReportForm({
  messageId,
  isPending,
  onCancel,
  onSubmit,
}: ReportFormProps): React.ReactElement {
  const [reason, setReason] = useState<ChatReportReason | null>(null);
  const [detail, setDetail] = useState('');

  const trimmedDetail = detail.trim();
  const needsDetail = reason === 'OTHER';
  const canSubmit =
    reason !== null && (!needsDetail || trimmedDetail.length > 0) && !isPending;

  return (
    <>
      <BottomSheetTitle>
        <Text size="body1" weight="bold" className="text-gray-900">
          메시지 신고하기
        </Text>
      </BottomSheetTitle>
      <Text size="caption1" className="pt-1 text-gray-500">
        신고 사유를 선택해 주세요. 접수된 신고는 관리자가 확인합니다.
      </Text>

      <div className="flex flex-col gap-1.5 pt-4">
        {CHAT_REPORT_REASONS.map((option) => {
          const selected = reason === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setReason(option.value)}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border px-3.5 py-3',
                'text-left transition-colors',
                selected
                  ? 'border-main-600 bg-main-100'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center',
                  'rounded-full border-2',
                  selected ? 'border-main-600' : 'border-gray-300'
                )}
              >
                {selected ? (
                  <span className="bg-main-600 h-2 w-2 rounded-full" />
                ) : null}
              </span>
              <Text
                size="body2"
                weight={selected ? 'bold' : 'regular'}
                className={selected ? 'text-main-800' : 'text-gray-800'}
              >
                {option.label}
              </Text>
            </button>
          );
        })}
      </div>

      <div className="pt-3">
        <TextArea
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          rows={3}
          count
          max={DETAIL_MAX}
          label="상세 내용"
          labelHint={needsDetail ? '필수' : '선택'}
          placeholder="신고 사유를 상세히 적어주세요."
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="secondary" size="lg" fullWidth onClick={onCancel}>
          취소
        </Button>
        <Button
          variant="danger"
          size="lg"
          fullWidth
          disabled={!canSubmit}
          onClick={() => {
            if (reason === null) {
              return;
            }
            onSubmit(messageId, {
              reason,
              detail: trimmedDetail || undefined,
            });
          }}
        >
          {isPending ? '접수 중…' : '신고하기'}
        </Button>
      </div>
    </>
  );
}

export function ChatReportSheet({
  messageId,
  isPending,
  onOpenChange,
  onSubmit,
}: ChatReportSheetProps): React.ReactElement {
  return (
    <BottomSheet
      open={messageId != null}
      onOpenChange={(next) => {
        if (!next) {
          onOpenChange(false);
        }
      }}
    >
      <BottomSheetContent className="px-5 pb-4">
        {/* key 로 폼을 새로 마운트한다 — 다음 신고가 지난 선택을 물려받지
            않게 하는 데 effect 로 상태를 되돌릴 이유가 없다. */}
        {messageId != null ? (
          <ReportForm
            key={messageId}
            messageId={messageId}
            isPending={isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        ) : null}
      </BottomSheetContent>
    </BottomSheet>
  );
}
