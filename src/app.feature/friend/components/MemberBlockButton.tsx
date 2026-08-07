'use client';

import { Button } from '@1d1s/design-system';
import { ConfirmDialog } from '@feature/member/settings/components/ConfirmDialog';
import { getApiErrorCode } from '@module/api/error';
import { notifyApiError } from '@module/api/errorNotify';
import { toast } from '@module/providers/toast';
import { Ban } from 'lucide-react';
import React, { useState } from 'react';

import { useBlockMember, useUnblockMember } from '../hooks/useFriendMutations';

interface MemberBlockButtonProps {
  memberId: number;
  /** 확인 다이얼로그 문구에 쓸 상대 닉네임(선택). */
  nickname?: string | null;
  /** 이미 차단된 상태(프로필 relationStatus === 'BLOCKED')인지. */
  blocked: boolean;
  /** 차단 성공 후 콜백 — 상세/카드에서 벗어나기 등. */
  onBlocked?(): void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * 회원 차단/해제 버튼. 프로필·일지 상세 등 작성자 옆(신고 옆)에 붙인다.
 * - blocked=true → "차단 해제"(즉시 해제, 확인 없음 — 되돌리기 쉬움)
 * - blocked=false → "차단"(확인 다이얼로그 → 차단). 차단 성공 시 서버가 그
 *   사용자의 콘텐츠를 전부 걸러내므로, 관련 쿼리 무효화(훅)로 즉시 사라진다.
 * 자기 자신에는 렌더하지 않는다(호출부에서 걸러 넘긴다).
 */
export function MemberBlockButton({
  memberId,
  nickname,
  blocked,
  onBlocked,
  size = 'md',
  className,
}: MemberBlockButtonProps): React.ReactElement {
  const block = useBlockMember();
  const unblock = useUnblockMember();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (blocked) {
    return (
      <Button
        variant="secondary"
        size={size}
        className={className}
        disabled={unblock.isPending}
        onClick={() => {
          unblock.mutate(memberId, {
            onSuccess: () => toast.success('차단을 해제했어요.'),
            onError: notifyApiError,
          });
        }}
      >
        차단 해제
      </Button>
    );
  }

  const who = nickname?.trim() ? `'${nickname.trim()}'님` : '이 사용자';

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        className={className}
        iconLeft={<Ban className="h-4 w-4" />}
        disabled={block.isPending}
        onClick={() => setConfirmOpen(true)}
      >
        차단
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone="danger"
        icon="Close"
        title="이 사용자를 차단할까요?"
        description={`${who}의 일지·댓글·응원이 더 이상 보이지 않아요. 차단은 언제든 해제할 수 있어요.`}
        confirmLabel="차단"
        pendingLabel="차단 중..."
        isPending={block.isPending}
        isDisabled={block.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          block.mutate(memberId, {
            onSuccess: () => {
              toast.success('차단했어요.');
              setConfirmOpen(false);
              onBlocked?.();
            },
            onError: (error) => {
              setConfirmOpen(false);
              // FRIEND-009: 이미 차단됨(409). 사용자에겐 결과가 같으므로 안내만.
              if (getApiErrorCode(error) === 'FRIEND-009') {
                toast.info('이미 차단한 사용자예요.');
                return;
              }
              notifyApiError(error);
            },
          });
        }}
      />
    </>
  );
}
