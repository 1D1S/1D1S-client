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

export function BetaButton(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-main-800 hover:bg-main-900 fixed bottom-6 left-6 z-50 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-lg transition"
      >
        BETA!
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-4 p-6 sm:max-w-[420px]">
          <DialogHeader className="items-center text-center">
            <DialogTitle>
              <Text size="heading1" weight="bold" className="text-black">
                베타 테스트 안내
              </Text>
            </DialogTitle>
          </DialogHeader>

          <DialogDescription asChild>
            <div className="flex flex-col gap-3 text-center">
              <Text size="body1" weight="regular" className="text-gray-700">
                1D1S는 현재 베타 테스트 기간 입니다. 문제가 발생하거나
                추가됐으면 하는 기능이 있다면 문의를 남겨주세요.
              </Text>
              <Text size="body2" weight="regular" className="text-gray-500">
                추가로 피드백 작성시 추첨을 통해 5분께 스타벅스 아이스
                아메리카노 쿠폰을 드리고 있으니 많은 관심 부탁드립니다!
              </Text>
            </div>
          </DialogDescription>

          <DialogFooter className="mt-2">
            <Button
              variant="default"
              type="button"
              className="w-full"
              onClick={() => {
                setOpen(false);
                window.open('https://forms.gle/yxgnTJdYViRmb2zR6', '_blank');
              }}
            >
              문의 남기기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
