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
import { toast } from '@module/providers/toast';
import {
  isNativeModalAvailable,
  openNativeModal,
} from '@module/utils/nativeBridge';
import React, { useEffect, useRef, useState } from 'react';

import { ReportType } from '../../board/type/diary';
import { useCreateDiaryReport } from '../hooks/useDiaryMutations';
import { parseNativeReportResult } from '../utils/nativeReport';

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
}: DiaryReportDialogProps): React.ReactElement | null {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [content, setContent] = useState('');
  const [alertState, setAlertState] = useState<ReportAlertState>(null);
  const reportMutation = useCreateDiaryReport();
  const nativeModalAvailable = isNativeModalAvailable();
  const nativeRequestInFlight = useRef(false);

  useEffect(() => {
    if (!open) {
      nativeRequestInFlight.current = false;
    }
  }, [open]);

  // 앱(WebView): 웹 Dialog 대신 네이티브 신고 시트로 위임. 일지 신고는 모든
  // 사유에 상세 내용이 필수라 detail.requiredFor 에 전 사유를 싣고 항상
  // 노출(alwaysShow)한다. 브라우저는 아래 웹 Dialog 폴백을 쓴다.
  useEffect(() => {
    if (!open || !nativeModalAvailable || nativeRequestInFlight.current) {
      return;
    }
    nativeRequestInFlight.current = true;
    let cancelled = false;
    const validTypes = REPORT_OPTIONS.map((option) => option.value);

    void (async () => {
      const value = await openNativeModal({
        title: '일지 신고하기',
        message: '신고 사유를 선택하고 상세 내용을 적어 주세요.',
        report: {
          reasons: REPORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          })),
          detail: {
            label: '상세 내용',
            placeholder: '신고 내용을 상세히 적어주세요.',
            requiredFor: validTypes,
            alwaysShow: true,
          },
        },
        buttons: [
          ...REPORT_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
          })),
          { label: '취소', value: 'cancel', style: 'cancel' as const },
        ],
      });
      if (cancelled) {
        return;
      }
      const parsed = parseNativeReportResult(value, validTypes, validTypes);
      if (!parsed) {
        onOpenChange(false);
        return;
      }
      reportMutation.mutate(
        {
          diaryId,
          reportType: parsed.reportType as ReportType,
          content: parsed.content,
        },
        {
          // 접수 피드백은 토스트로. 모달을 한 번 더 띄우면 신고 시트를
          // 닫자마자 또 탭해야 하고, 앱에서는 "아무 일도 안 일어난 것처럼"
          // 보인다는 피드백이 있었다.
          onSuccess: () => {
            toast.success('신고가 접수되었습니다.');
            onOpenChange(false);
          },
          onError: () => {
            void openNativeModal({
              title: '신고 실패',
              message: '신고 접수 중 오류가 발생했습니다.',
              buttons: [{ label: '확인', value: 'ok' }],
            });
            onOpenChange(false);
          },
        }
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [open, diaryId, nativeModalAvailable, onOpenChange, reportMutation]);

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

  // 네이티브에선 위 effect 가 OS 신고 시트를 띄우므로 웹 트리는 그리지 않는다.
  if (nativeModalAvailable) {
    return null;
  }

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
              size="md"
              variant="ghost"
              className="flex-1"
              onClick={handleClose}
            >
              취소
            </Button>
            <Button
              size="md"
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
