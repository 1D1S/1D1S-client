import { OdosButton } from '@/shared/components/odos-ui/button';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { ChallengeCreateDialogContent } from './challenge-create-dialog-content';

/**
 * ChallengeCreateDialog
 * 챌린지 생성 다이얼로그 컴포넌트
 */
export function ChallengeCreateDialog({
  onConfirm,
  disabled,
}: {
  onConfirm?(): void;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <OdosButton variant="default" type="button" disabled={disabled}>
          완료
        </OdosButton>
      </DialogTrigger>
      <DialogContent className="min-w-150 gap-6 p-6">
        <DialogHeader className="items-center">
          <DialogTitle>
            <OdosLabel size="heading1" weight="bold" className="text-black">
              챌린지 생성
            </OdosLabel>
          </DialogTitle>
        </DialogHeader>
        {/* 챌린지 정보 요약 */}
        <div className="h-[1px] w-full bg-gray-300" />
        <OdosLabel size="heading2" weight="medium" className="text-gray-500">
          미리 보기
        </OdosLabel>

        <ChallengeCreateDialogContent />

        <div className="h-[1px] w-full bg-gray-300" />

        {/* 챌린지 생성 확인 메시지 Footer */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogDescription>
            <OdosLabel
              size="heading1"
              weight="bold"
              className="text-black"
              id="challenge-create-dialog"
            >
              위와 같이 챌린지를 생성하시겠습니까?
            </OdosLabel>
          </DialogDescription>
        </div>
        <DialogFooter className="gap-4">
          <DialogClose asChild>
            <OdosButton variant="outline" type="button" className="w-37.5">
              취소
            </OdosButton>
          </DialogClose>
          <DialogClose asChild>
            <OdosButton variant="default" type="submit" className="w-37.5" onClick={onConfirm}>
              생성
            </OdosButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
