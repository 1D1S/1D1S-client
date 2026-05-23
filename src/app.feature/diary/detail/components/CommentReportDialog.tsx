'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Text,
} from '@1d1s/design-system';
import { AlertDialog } from '@component/AlertDialog';
import { cn } from '@module/utils/cn';
import React, { useState } from 'react';

import { useReportComment } from '../hooks/useDiaryCommentMutations';
import { CommentReportType, CreateCommentReportRequest } from '../type/comment';

type ReportAlertState =
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }
  | null;

interface CommentReportDialogProps {
  commentId: number | null;
  open: boolean;
  onOpenChange(open: boolean): void;
}

const REPORT_TYPES: Array<{ type: CommentReportType; label: string }> = [
  { type: 'BAD_CONTENT', label: '부적절한 내용' },
  { type: 'SPAM', label: '스팸 / 광고' },
  { type: 'ETC', label: '기타 사유' },
];

export function CommentReportDialog({
  commentId,
  open,
  onOpenChange,
}: CommentReportDialogProps): React.ReactElement {
  const [selectedType, setSelectedType] = useState<CommentReportType | null>(
    null
  );
  const [content, setContent] = useState('');
  const [alertState, setAlertState] = useState<ReportAlertState>(null);
  const reportMutation = useReportComment();

  const isEtc = selectedType === 'ETC';
  const isContentValid = !isEtc || content.trim().length > 0;
  const canSubmit =
    selectedType !== null && isContentValid && !reportMutation.isPending;

  const handleClose = (): void => {
    onOpenChange(false);
    setTimeout((): void => {
      setSelectedType(null);
      setContent('');
      reportMutation.reset();
    }, 200);
  };

  const handleSubmit = (): void => {
    if (!selectedType || commentId === null) {
      return;
    }
    if (isEtc && !content.trim()) {
      return;
    }

    const data: CreateCommentReportRequest =
      selectedType === 'ETC'
        ? { reportType: 'ETC', content: content.trim() }
        : { reportType: selectedType };

    reportMutation.mutate(
      { commentId, data },
      {
        onSuccess: (): void => {
          setAlertState({
            kind: 'success',
            message: '신고가 접수되었습니다.',
          });
        },
        onError: (): void => {
          setAlertState({
            kind: 'error',
            message: '신고 접수 중 오류가 발생했습니다.',
          });
        },
      }
    );
  };

  const handleAlertConfirm = (): void => {
    const kind = alertState?.kind;
    setAlertState(null);
    if (kind === 'success') {
      handleClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleClose();
          }
        }}
      >
        <DialogContent className="gap-5 px-6 py-6 sm:max-w-[460px]">
          <DialogHeader className="items-center text-center">
            <DialogTitle asChild>
              <Text
                size="heading2"
                weight="extrabold"
                className="text-gray-900"
              >
                댓글 신고하기
              </Text>
            </DialogTitle>
            <DialogDescription className="hidden">
              댓글을 신고하는 양식입니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Text size="body2" weight="bold" className="text-gray-900">
                신고 사유
              </Text>
              <div className="flex flex-col gap-2">
                {REPORT_TYPES.map((rt) => {
                  const isSelected = selectedType === rt.type;
                  return (
                    <button
                      key={rt.type}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={(): void => setSelectedType(rt.type)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border',
                        'px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'border-main-500 bg-main-50 text-main-900'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center',
                          'rounded-full border-2',
                          isSelected ? 'border-main-500' : 'border-gray-300'
                        )}
                      >
                        {isSelected ? (
                          <span className="bg-main-500 h-2 w-2 rounded-full" />
                        ) : null}
                      </span>
                      <Text size="body2" weight="medium">
                        {rt.label}
                      </Text>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              aria-hidden={!isEtc}
              className={cn(
                'grid transition-[grid-template-rows,opacity]',
                'duration-300 ease-out motion-reduce:transition-none',
                isEtc
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-2 pt-5">
                  <Text size="body2" weight="bold" className="text-gray-900">
                    상세 내용
                  </Text>
                  <textarea
                    tabIndex={isEtc ? 0 : -1}
                    className={cn(
                      'focus:border-main-400 focus:ring-main-400',
                      'h-28 w-full resize-none rounded-lg border border-gray-200',
                      'p-3 text-sm focus:ring-1 focus:outline-none'
                    )}
                    placeholder="신고 사유를 상세히 적어주세요."
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2">
            <Button
              size="medium"
              variant="ghost"
              className="flex-1"
              onClick={handleClose}
            >
              취소
            </Button>
            <Button
              size="medium"
              className="flex-1"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {reportMutation.isPending ? '처리중...' : '신고하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={alertState !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleAlertConfirm();
          }
        }}
        title={alertState?.kind === 'success' ? '신고 접수 완료' : '신고 실패'}
        description={alertState?.message ?? ''}
        onConfirm={handleAlertConfirm}
      />
    </>
  );
}
