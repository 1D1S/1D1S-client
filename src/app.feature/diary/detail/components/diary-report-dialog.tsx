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
import React, { useState } from 'react';

import { ReportType } from '../../board/type/diary';
import { useCreateDiaryReport } from '../hooks/use-diary-mutations';

interface DiaryReportDialogProps {
  diaryId: number;
  open: boolean;
  onOpenChange(open: boolean): void;
}

const REPORT_TYPES: Array<{ type: ReportType; label: string }> = [
  { type: 'BAD_TITLE_CONTENT', label: '부적절한 제목 및 내용' },
  { type: 'BAD_IMAGE', label: '부적절한 이미지' },
  { type: 'ETC', label: '기타 부적절한 다이어리' },
];

export function DiaryReportDialog({
  diaryId,
  open,
  onOpenChange,
}: DiaryReportDialogProps): React.ReactElement {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [content, setContent] = useState('');
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
    if (!selectedType || !content.trim()) {return;}

    reportMutation.mutate(
      {
        diaryId,
        reportType: selectedType,
        content: content.trim(),
      },
      {
        onSuccess: (): void => {
          alert('신고가 접수되었습니다.');
          handleClose();
        },
        onError: (): void => {
          alert('신고 접수 중 오류가 발생했습니다.');
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="gap-6 px-8 py-6 sm:max-w-[480px]">
        <DialogHeader className="items-center text-center">
          <DialogTitle>일지 신고하기</DialogTitle>
          <DialogDescription className="hidden">
            일지를 신고하는 양식입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Text size="body1" weight="bold" className="text-gray-900">
              신고 사유
            </Text>
            <div className="flex flex-col gap-2">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.type}
                  type="button"
                  onClick={(): void => setSelectedType(rt.type)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                    selectedType === rt.type
                      ? 'border-main-500 bg-main-50 text-main-900'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Text size="body2" weight="medium">
                    {rt.label}
                  </Text>
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      selectedType === rt.type
                        ? 'border-main-500' // mock a checked inner style
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedType === rt.type && (
                      <div className="bg-main-500 h-2 w-2 rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Text size="body1" weight="bold" className="text-gray-900">
              상세 내용
            </Text>
            <textarea
              className="focus:border-main-400 focus:ring-main-400 h-28 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:ring-1 focus:outline-none"
              placeholder="신고 내용을 상세히 적어주세요."
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
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
  );
}
