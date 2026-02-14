import {
  Button,
  Text,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@1d1s/design-system';
import { ChallengeCreateDialogContent } from './challenge-create-dialog-content';

/**
 * ChallengeCreateDialog
 * 챌린지 생성 다이얼로그 컴포넌트
 */
export function ChallengeCreateDialog({
  onConfirm,
  disabled,
  triggerText = '완료',
}: {
  onConfirm?(): void;
  disabled?: boolean;
  triggerText?: string;
}): React.ReactElement {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" type="button" disabled={disabled}>
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-150 gap-6 p-6">
        <DialogHeader className="items-center">
          <DialogTitle>
            <Text size="heading1" weight="bold" className="text-black">
              챌린지 생성
            </Text>
          </DialogTitle>
        </DialogHeader>
        {/* 챌린지 정보 요약 */}
        <div className="h-[1px] w-full bg-gray-300" />
        <Text size="heading2" weight="medium" className="text-gray-500">
          미리 보기
        </Text>

        <ChallengeCreateDialogContent />

        <div className="h-[1px] w-full bg-gray-300" />

        {/* 챌린지 생성 확인 메시지 Footer */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogDescription>
            <Text
              size="heading1"
              weight="bold"
              className="text-black"
              id="challenge-create-dialog"
            >
              위와 같이 챌린지를 생성하시겠습니까?
            </Text>
          </DialogDescription>
        </div>
        <DialogFooter className="gap-4">
          <DialogClose asChild>
            <Button variant="outlined" type="button" className="w-37.5">
              취소
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="default" type="submit" className="w-37.5" onClick={onConfirm}>
              생성
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
