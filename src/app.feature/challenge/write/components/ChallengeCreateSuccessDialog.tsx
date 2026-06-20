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
import { cn } from '@module/utils/cn';
import { Link2, Lock, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ChallengeCreateSuccessDialogProps
  extends React.ComponentProps<typeof Dialog> {
  challengeId?: number;
  // 비공개 챌린지 여부 — 공유 안내 문구/비밀번호 노출에 사용한다.
  isPrivate?: boolean;
  // 비공개 챌린지의 참여 비밀번호.
  password?: string;
}

/**
 * ChallengeCreateSuccessDialog
 * 챌린지 생성 완료 + 참여 링크 공유 다이얼로그 컴포넌트
 */
// DialogContent의 close 애니메이션 길이(duration-200)와 동기화 — 닫힘 모션이
// 끝난 뒤 라우팅이 일어나도록 한다.
const CLOSE_ANIMATION_MS = 200;

const COPY_BUTTON_CLASS = cn(
  'shrink-0 rounded-md px-2.5 py-1 text-[12px] font-bold',
  'text-main-800 hover:bg-main-100 transition-colors'
);

const SHARE_ROW_CLASS = cn(
  'rounded-2 flex items-center gap-2 border border-gray-200',
  'bg-gray-50 px-3.5 py-2.5'
);

export function ChallengeCreateSuccessDialog({
  challengeId,
  isPrivate = false,
  password,
  onOpenChange,
  ...props
}: ChallengeCreateSuccessDialogProps): React.ReactElement {
  const router = useRouter();
  // 참여 링크는 클라이언트에서만 origin 을 알 수 있다. 공유 영역은 다이얼로그가
  // 열렸을 때(클라이언트 상호작용)만 렌더되므로 렌더 중 직접 계산해도 안전하다.
  const shareLink =
    challengeId !== undefined && typeof window !== 'undefined'
      ? `${window.location.origin}/challenge/${challengeId}`
      : '';

  const closeAndNavigate = (to: string): void => {
    onOpenChange?.(false);
    window.setTimeout(() => router.push(to), CLOSE_ANIMATION_MS);
  };

  const copyText = async (text: string, message: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error('복사에 실패했어요. 직접 복사해주세요.');
    }
  };

  const handleShare = async (): Promise<void> => {
    if (!shareLink) {
      return;
    }
    const text =
      isPrivate && password
        ? `비공개 챌린지에 초대합니다! 비밀번호: ${password}`
        : '챌린지에 함께 도전해요!';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: '챌린지 초대', text, url: shareLink });
      } catch {
        // 사용자가 공유를 취소한 경우 — 별도 처리 없음
      }
      return;
    }
    await copyText(shareLink, '참여 링크가 복사되었습니다.');
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={cn(
          'flex w-[calc(100%-2rem)] flex-col items-center gap-6',
          'sm:min-w-120 [&>button:last-of-type]:hidden'
        )}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="mt-6 items-center">
          <DialogTitle>
            <DialogDescription>
              <Text
                size="heading1"
                weight="bold"
                className="text-center text-black"
              >
                챌린지 만들기가 완료되었습니다!
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

        {challengeId !== undefined ? (
          <div className="w-full space-y-3">
            <Text
              size="caption1"
              weight="regular"
              className="block text-center text-gray-500"
            >
              {isPrivate
                ? '비공개 챌린지예요. 링크와 비밀번호를 공유해 친구를 초대하세요.'
                : '아래 링크로 친구를 초대해보세요.'}
            </Text>

            <div className={SHARE_ROW_CLASS}>
              <Link2 className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                {shareLink}
              </span>
              <button
                type="button"
                className={COPY_BUTTON_CLASS}
                onClick={() =>
                  copyText(shareLink, '참여 링크가 복사되었습니다.')
                }
              >
                복사
              </button>
            </div>

            {isPrivate && password ? (
              <div className={SHARE_ROW_CLASS}>
                <Lock className="h-4 w-4 shrink-0 text-gray-400" />
                <span
                  className={cn(
                    'min-w-0 flex-1 text-sm font-bold',
                    'tracking-[0.1em] text-gray-700'
                  )}
                >
                  {password}
                </span>
                <button
                  type="button"
                  className={COPY_BUTTON_CLASS}
                  onClick={() =>
                    copyText(password, '비밀번호가 복사되었습니다.')
                  }
                >
                  복사
                </button>
              </div>
            ) : null}

            <Button
              variant="outlined"
              type="button"
              fullWidth
              onClick={handleShare}
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              공유하기
            </Button>
          </div>
        ) : null}

        <DialogFooter className="grid w-full grid-cols-2 gap-3">
          <Button
            variant="outlined"
            type="button"
            onClick={() => closeAndNavigate('/')}
          >
            홈
          </Button>
          <Button
            variant="default"
            type="button"
            onClick={() => {
              if (challengeId !== undefined) {
                closeAndNavigate(`/challenge/${challengeId}`);
              } else {
                onOpenChange?.(false);
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
