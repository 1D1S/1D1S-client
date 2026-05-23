'use client';

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  RadioGroup,
  Text,
  TextArea,
} from '@1d1s/design-system';
import { AlertDialog } from '@component/AlertDialog';
import React, { useState } from 'react';

import { ReportType } from '../../board/type/diary';
import { useCreateDiaryReport } from '../hooks/useDiaryMutations';

type ReportAlertState =
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }
  | null;

interface DiaryReportDialogProps {
  diaryId: number;
  open: boolean;
  onOpenChange(open: boolean): void;
}

const REPORT_OPTIONS: Array<{ value: ReportType; label: string }> = [
  { value: 'BAD_TITLE_CONTENT', label: '부적절한 제목 및 내용' },
  { value: 'BAD_IMAGE', label: '부적절한 이미지' },
  { value: 'ETC', label: '기타 부적절한 다이어리' },
];

export function DiaryReportDialog({
  diaryId,
  open,
  onOpenChange,
}: DiaryReportDialogProps): React.ReactElement {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [content, setContent] = useState('');
  const [alertState, setAlertState] = useState<ReportAlertState>(null);
  const reportMutation = useCreateDiaryReport();

  const handleClose = (): void => {
    onOpenChange(false);
    setTimeout((): void => {
      setSelectedType(null);
      setContent('');
      reportMutation.reset();
    }, 200);
  };

  const handleSubmit = (): void => {
    if (!selectedType || !content.trim()) {
      return;
    }

    reportMutation.mutate(
      {
        diaryId,
        reportType: selectedType,
        content: content.trim(),
      },
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
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>일지 신고하기</DialogTitle>
            <DialogDescription className="sr-only">
              일지를 신고하는 양식입니다.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Text size="body2" weight="bold" className="text-gray-900">
                신고 사유
              </Text>
              <RadioGroup
                name="diary-report-type"
                options={REPORT_OPTIONS}
                value={selectedType ?? undefined}
                onChange={(value): void => setSelectedType(value as ReportType)}
              />
            </div>

            <TextArea
              label="상세 내용"
              placeholder="신고 내용을 상세히 적어주세요."
              rows={4}
              value={content}
              onChange={(event): void => setContent(event.target.value)}
            />
          </DialogBody>

          <DialogFooter>
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
              disabled={
                !selectedType || !content.trim() || reportMutation.isPending
              }
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
