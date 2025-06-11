import Image from 'next/image';
import { OdosButton } from '@/shared/components/odos-ui/button';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

/**
 * ChallengeCreateSuccessDialog
 * 챌린지 생성 다이얼로그 컴포넌트
 */
export function ChallengeCreateSuccessDialog({
  ...props
}: React.ComponentProps<typeof Dialog>): React.ReactElement {
  return (
    <Dialog {...props}>
      <DialogContent className="min-w-150 items-center gap-25 px-8 py-12">
        <DialogHeader className="items-center">
          <DialogTitle>
            <OdosLabel size="display1" weight="bold" className="text-black">
              챌린지 생성이 완료되었습니다!
            </OdosLabel>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <div className="bg-main-900 flex h-37.5 w-37.5 items-center justify-center rounded-full">
            <Image src="/images/check.png" alt="success" width="75" height="75" />
          </div>
        </div>
        <DialogFooter className="justify-center sm:justify-center">
          <DialogClose asChild>
            <OdosButton variant="default" type="button" className="w-37.5">
              확인
            </OdosButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
