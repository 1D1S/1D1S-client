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
import { useRouter } from 'next/navigation';

interface ChallengeCreateSuccessDialogProps
  extends React.ComponentProps<typeof Dialog> {
  challengeId?: number;
}

/**
 * ChallengeCreateSuccessDialog
 * 챌린지 생성 다이얼로그 컴포넌트
 */
export function ChallengeCreateSuccessDialog({
  challengeId,
  onOpenChange,
  ...props
}: ChallengeCreateSuccessDialogProps): React.ReactElement {
  const router = useRouter();

  const handleClose = (): void => {
    onOpenChange?.(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className="flex w-[calc(100%-2rem)] flex-col items-center gap-8 sm:min-w-120 [&>button:last-of-type]:hidden"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="mt-8 items-center">
          <DialogTitle>
            <DialogDescription>
              <Text size="heading1" weight="bold" className="text-center text-black">
                챌린지 생성이 완료되었습니다!
              </Text>
            </DialogDescription>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <div className="bg-main-900 flex h-20 w-20 items-center justify-center rounded-full">
            <svg
              viewBox="0 0 40 40"
              className="h-12 w-12"
              fill="none"
              aria-label="success"
              role="img"
            >
              <path
                d="M9 21 L17 29"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="1"
                className="animate-draw-check-1"
              />
              <path
                d="M17 29 L32 12"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="1"
                className="animate-draw-check-2"
              />
            </svg>
          </div>
        </div>
        <DialogFooter className="grid w-full grid-cols-2 gap-3">
          <Button
            variant="outlined"
            type="button"
            onClick={() => {
              handleClose();
              router.push('/');
            }}
          >
            홈
          </Button>
          <Button
            variant="default"
            type="button"
            onClick={() => {
              handleClose();
              if (challengeId !== undefined) {
                router.push(`/challenge/${challengeId}`);
              }
            }}
          >
            챌린지 확인하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
