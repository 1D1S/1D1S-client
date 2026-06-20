import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Lock } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface ChallengePasswordDialogProps {
  open: boolean;
  // 비밀번호 검증 요청이 진행 중인지.
  isPending: boolean;
  // 닫기(취소) — 보통 챌린지 목록으로 돌려보낸다.
  onClose(): void;
  // 비밀번호 검증 + 참여 요청.
  onSubmit(password: string): void;
}

export function ChallengePasswordDialog({
  open,
  isPending,
  onClose,
  onSubmit,
}: ChallengePasswordDialogProps): React.ReactElement {
  const [password, setPassword] = useState('');
  const trimmedPassword = password.trim();

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    if (!trimmedPassword || isPending) {
      return;
    }
    onSubmit(trimmedPassword);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showClose={false}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className="gap-0 overflow-hidden p-0 sm:max-w-[420px]"
      >
        <DialogHeader className="flex-col items-start gap-1.5 pb-2">
          <div
            className={cn(
              'mb-1 flex h-11 w-11 items-center justify-center',
              'bg-main-200 rounded-full'
            )}
          >
            <Lock className="text-main-800 h-5 w-5" />
          </div>
          <DialogTitle
            className={cn(
              'text-[17px] font-extrabold tracking-[-0.3px] text-gray-900'
            )}
          >
            비공개 챌린지
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-gray-500">
            참여하려면 비밀번호를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <input
              type="password"
              autoFocus
              autoComplete="off"
              maxLength={20}
              placeholder="비밀번호 입력"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-label="챌린지 비밀번호"
              className={cn(
                'rounded-2 w-full border border-gray-200',
                'bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900',
                'focus:border-main-800 outline-none'
              )}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              size="medium"
              variant="outlined"
              type="button"
              className="min-w-[80px]"
              onClick={onClose}
            >
              닫기
            </Button>
            <Button
              size="medium"
              type="submit"
              className="min-w-[96px]"
              disabled={isPending || !trimmedPassword}
            >
              {isPending ? '확인 중...' : '참여하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
