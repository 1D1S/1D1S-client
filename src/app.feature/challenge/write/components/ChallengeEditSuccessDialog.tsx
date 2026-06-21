import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';

interface ChallengeEditSuccessDialogProps
  extends React.ComponentProps<typeof Dialog> {
  challengeId?: number;
}

// DialogContent의 close 애니메이션 길이(duration-200)와 동기화 — 닫힘 모션이
// 끝난 뒤 라우팅이 일어나도록 한다.
const CLOSE_ANIMATION_MS = 200;

export function ChallengeEditSuccessDialog({
  challengeId,
  onOpenChange,
  ...props
}: ChallengeEditSuccessDialogProps): React.ReactElement {
  const router = useRouter();

  const closeThen = (navigate: () => void): void => {
    onOpenChange?.(false);
    window.setTimeout(navigate, CLOSE_ANIMATION_MS);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={cn(
          'flex w-[calc(100%-2rem)] flex-col items-center gap-8',
          'px-6 pt-10 pb-6 sm:min-w-120 [&>button:last-of-type]:hidden'
        )}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="items-center">
          <DialogTitle>
            <DialogDescription>
              <Text
                size="heading1"
                weight="bold"
                className="text-center text-black"
              >
                챌린지 수정이 완료되었습니다!
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
        <div className="grid w-full grid-cols-2 gap-3">
          <Button
            variant="outlined"
            type="button"
            onClick={() => closeThen(() => router.back())}
          >
            돌아가기
          </Button>
          <Button
            variant="default"
            type="button"
            onClick={() => {
              if (challengeId !== undefined) {
                closeThen(() => router.push(`/challenge/${challengeId}`));
              } else {
                onOpenChange?.(false);
              }
            }}
          >
            챌린지 확인하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
