'use client';

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  GoalAddList,
  TextField,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Trash2 } from 'lucide-react';
import React from 'react';

import type { ChallengeGoalEditors } from '../hooks/useChallengeGoalEditors';

interface GoalAddListModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description: string;
  goals: string[];
  onGoalsChange(goals: string[]): void;
  submitLabel: string;
  submitDisabled: boolean;
  submitMinWidthClass: string;
  onSubmit(): void;
}

// 목표 입력/수정 모달의 공통 chrome. 본문은 GoalAddList 로 동일하고
// 제목·설명·제출 버튼(라벨/너비/핸들러)만 다르다.
function GoalAddListModal({
  open,
  onOpenChange,
  title,
  description,
  goals,
  onGoalsChange,
  submitLabel,
  submitDisabled,
  submitMinWidthClass,
  onSubmit,
}: GoalAddListModalProps): React.ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[460px]">
        <DialogHeader className="flex-col items-start gap-1.5 pb-2">
          <DialogTitle className="text-[17px] font-extrabold tracking-[-0.3px] text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-gray-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <GoalAddList
            goals={goals}
            onGoalsChange={onGoalsChange}
            placeholder="목표를 입력하고 Enter를 눌러 추가하세요"
            inputAriaLabel="목표 입력"
            maxGoals={5}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            size="md"
            variant="secondary"
            className="min-w-[80px]"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            size="md"
            className={submitMinWidthClass}
            disabled={submitDisabled}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ChallengeGoalModalsProps {
  editors: ChallengeGoalEditors;
}

/**
 * 챌린지 상세의 목표 입력/수정 3종 모달. 상태·핸들러는
 * useChallengeGoalEditors 가 소유하고, 이 컴포넌트는 렌더만 담당한다.
 */
export function ChallengeGoalModals({
  editors,
}: ChallengeGoalModalsProps): React.ReactElement {
  return (
    <>
      <GoalAddListModal
        open={editors.showFreeGoalModal}
        onOpenChange={editors.setShowFreeGoalModal}
        title="내 목표 입력"
        description="챌린지에서 달성할 목표를 입력하고 Enter 를 눌러 추가해 주세요. (최대 5개)"
        goals={editors.freeGoalInputs}
        onGoalsChange={editors.setFreeGoalInputs}
        submitLabel={editors.isJoinPending ? '처리 중...' : '참여 신청'}
        submitDisabled={editors.isJoinPending}
        submitMinWidthClass="min-w-[112px]"
        onSubmit={editors.handleFreeGoalSubmit}
      />

      <GoalAddListModal
        open={editors.showEditGoalModal}
        onOpenChange={editors.setShowEditGoalModal}
        title="내 목표 수정"
        description="새 목표를 입력하고 Enter 를 눌러 추가해 주세요. (최대 5개)"
        goals={editors.editGoalInputs}
        onGoalsChange={editors.setEditGoalInputs}
        submitLabel={
          editors.isUpdateParticipantGoalPending ? '저장 중...' : '저장'
        }
        submitDisabled={editors.isUpdateParticipantGoalPending}
        submitMinWidthClass="min-w-[96px]"
        onSubmit={editors.handleEditGoalSubmit}
      />

      <Dialog
        open={editors.showEditChallengeGoalsModal}
        onOpenChange={editors.setShowEditChallengeGoalsModal}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[460px]">
          <DialogHeader className="flex-col items-start gap-1.5 pb-2">
            <DialogTitle className="text-[17px] font-extrabold tracking-[-0.3px] text-gray-900">
              챌린지 목표 수정
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-gray-500">
              챌린지 시작 전에만 목표를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {editors.challengeGoalInputs.map((goal) => (
                <div key={goal.id} className="flex items-center gap-2">
                  <TextField
                    value={goal.value}
                    onChange={(event) => {
                      editors.setChallengeGoalInputs((prev) =>
                        prev.map((entry) =>
                          entry.id === goal.id
                            ? { ...entry, value: event.target.value }
                            : entry
                        )
                      );
                    }}
                    placeholder="목표를 입력하세요"
                    className="flex-1"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    aria-label="목표 삭제"
                    className={cn(
                      'flex h-10 w-10 shrink-0 cursor-pointer',
                      'items-center justify-center rounded-lg text-gray-500',
                      'transition-colors hover:bg-gray-100 hover:text-red-600'
                    )}
                    onClick={() => {
                      editors.setChallengeGoalInputs((prev) =>
                        prev.filter((entry) => entry.id !== goal.id)
                      );
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              disabled={editors.challengeGoalInputs.length >= 10}
              onClick={() =>
                editors.setChallengeGoalInputs((prev) => [
                  ...prev,
                  editors.createGoalEntry(),
                ])
              }
            >
              + 목표 추가
            </Button>
          </DialogBody>
          <DialogFooter>
            <Button
              size="md"
              variant="secondary"
              className="min-w-[80px]"
              onClick={() => editors.setShowEditChallengeGoalsModal(false)}
            >
              취소
            </Button>
            <Button
              size="md"
              className="min-w-[96px]"
              disabled={editors.isUpdateChallengePending}
              onClick={editors.handleEditChallengeGoalsSubmit}
            >
              {editors.isUpdateChallengePending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
