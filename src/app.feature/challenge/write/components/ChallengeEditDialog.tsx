import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Text,
} from '@1d1s/design-system';

import { ChallengeEditDialogContent } from './ChallengeEditDialogContent';

interface ChallengeEditDialogProps {
  onConfirm?(): void;
  disabled?: boolean;
  triggerText?: string;
  triggerClassName?: string;
  startDate: string;
  endDate: string;
}

export function ChallengeEditDialog({
  onConfirm,
  disabled,
  triggerText = '수정 완료',
  triggerClassName,
  startDate,
  endDate,
}: ChallengeEditDialogProps): React.ReactElement {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          type="button"
          disabled={disabled}
          className={triggerClassName}
        >
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[520px]">
        <DialogTitle className="sr-only">챌린지 수정 미리보기</DialogTitle>
        <div className="min-h-0 flex-1 overflow-y-auto p-6 pt-10">
          <ChallengeEditDialogContent startDate={startDate} endDate={endDate} />
        </div>

        <div className="h-px w-full bg-gray-200" />

        <div className="flex flex-col gap-4 p-6">
          <DialogDescription asChild>
            <Text
              size="heading2"
              weight="bold"
              className="block text-center text-black"
              id="challenge-edit-dialog"
            >
              위와 같이 챌린지를 수정하시겠습니까?
            </Text>
          </DialogDescription>

          <DialogFooter className="grid grid-cols-2 gap-3 sm:gap-3">
            <DialogClose asChild>
              <Button variant="outlined" type="button">
                취소
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="default" type="submit" onClick={onConfirm}>
                수정 완료
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
