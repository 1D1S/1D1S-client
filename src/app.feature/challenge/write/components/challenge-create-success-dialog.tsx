import Image from 'next/image';
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
} from '@1d1s/design-system';

/**
 * ChallengeCreateSuccessDialog
 * 챌린지 생성 다이얼로그 컴포넌트
 */
export function ChallengeCreateSuccessDialog({
  ...props
}: React.ComponentProps<typeof Dialog>): React.ReactElement {
  return (
    <Dialog {...props}>
      <DialogContent className="flex min-w-120 flex-col items-center gap-16">
        <DialogHeader className="items-center mt-8">
          <DialogTitle>
            <DialogDescription>
              <Text size="display2" weight="bold" className="text-black">
                챌린지 생성이 완료되었습니다!
              </Text>
            </DialogDescription>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <div className="bg-main-900 flex h-37.5 w-37.5 items-center justify-center rounded-full">
            <Image src="/images/check.png" alt="success" width="75" height="75" />
          </div>
        </div>
        <DialogFooter className="justify-center mb-8">
          <DialogClose asChild>
            <Button variant="default" type="button" className="w-37.5">
              확인
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
