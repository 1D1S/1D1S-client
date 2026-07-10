'use client';

import { notifyApiError } from '@module/api/errorNotify';
import { toast } from '@module/providers/toast';
import { useState } from 'react';

import type { ChallengeGoal } from '../../board/type/challenge';
import {
  useJoinChallenge,
  useUpdateChallenge,
  useUpdateParticipantGoal,
} from './useChallengeMutations';

export interface ChallengeGoalEntry {
  id: string;
  value: string;
}

function createGoalEntry(value = ''): ChallengeGoalEntry {
  return { id: crypto.randomUUID(), value };
}

interface UseChallengeGoalEditorsParams {
  challengeId: number;
  /** 챌린지 고정 목표 (수정 모달 초기값) */
  goals: ChallengeGoal[];
  isChallengeAlreadyEnded: boolean;
  /** 참여 신청 mutation — 자유 목표 참여와 공유하므로 주입받는다. */
  joinChallenge: ReturnType<typeof useJoinChallenge>;
}

export interface ChallengeGoalEditors {
  // 자유 목표 참여 모달
  showFreeGoalModal: boolean;
  setShowFreeGoalModal(open: boolean): void;
  freeGoalInputs: string[];
  setFreeGoalInputs(goals: string[]): void;
  openFreeGoalModal(): void;
  handleFreeGoalSubmit(): void;
  // 내 목표 수정 모달 (자유 목표 참여자)
  showEditGoalModal: boolean;
  setShowEditGoalModal(open: boolean): void;
  editGoalInputs: string[];
  setEditGoalInputs(goals: string[]): void;
  openEditGoalModal(): void;
  handleEditGoalSubmit(): void;
  // 챌린지 목표 수정 모달 (호스트)
  showEditChallengeGoalsModal: boolean;
  setShowEditChallengeGoalsModal(open: boolean): void;
  challengeGoalInputs: ChallengeGoalEntry[];
  setChallengeGoalInputs(
    updater: (prev: ChallengeGoalEntry[]) => ChallengeGoalEntry[]
  ): void;
  createGoalEntry(value?: string): ChallengeGoalEntry;
  openEditChallengeGoalsModal(): void;
  handleEditChallengeGoalsSubmit(): void;
  // 제출 pending (버튼 라벨/비활성용)
  isJoinPending: boolean;
  isUpdateParticipantGoalPending: boolean;
  isUpdateChallengePending: boolean;
}

/**
 * 챌린지 상세의 목표 입력/수정 3종(자유 목표 참여, 내 목표 수정, 챌린지
 * 목표 수정) 상태·핸들러를 한 곳으로 모은 훅. ChallengeDetailScreen 에서
 * 분리했으며 동작은 동일하다.
 */
export function useChallengeGoalEditors({
  challengeId,
  goals,
  isChallengeAlreadyEnded,
  joinChallenge,
}: UseChallengeGoalEditorsParams): ChallengeGoalEditors {
  const updateChallenge = useUpdateChallenge();
  const updateParticipantGoal = useUpdateParticipantGoal();

  const [showFreeGoalModal, setShowFreeGoalModal] = useState(false);
  const [freeGoalInputs, setFreeGoalInputs] = useState<string[]>(['']);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [editGoalInputs, setEditGoalInputs] = useState<string[]>(['']);
  const [showEditChallengeGoalsModal, setShowEditChallengeGoalsModal] =
    useState(false);
  const [challengeGoalInputs, setChallengeGoalInputs] = useState<
    ChallengeGoalEntry[]
  >(() => [createGoalEntry()]);

  const openFreeGoalModal = (): void => {
    setFreeGoalInputs([]);
    setShowFreeGoalModal(true);
  };

  const handleFreeGoalSubmit = (): void => {
    if (isChallengeAlreadyEnded) {
      toast.error('종료된 챌린지는 참여 신청을 보낼 수 없습니다.');
      setShowFreeGoalModal(false);
      return;
    }
    const validGoals = freeGoalInputs
      .map((goal) => goal.trim())
      .filter(Boolean);
    if (validGoals.length === 0) {
      toast.error('목표를 최소 1개 이상 입력해 주세요.');
      return;
    }
    joinChallenge.mutate(
      { challengeId, data: validGoals },
      {
        onSuccess: () => {
          setShowFreeGoalModal(false);
          toast.success('챌린지 참여 신청이 완료되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  const openEditGoalModal = (): void => {
    setEditGoalInputs(['']);
    setShowEditGoalModal(true);
  };

  const handleEditGoalSubmit = (): void => {
    const validGoals = editGoalInputs
      .map((goalInput) => goalInput.trim())
      .filter(Boolean);
    if (validGoals.length === 0) {
      toast.error('목표를 최소 1개 이상 입력해 주세요.');
      return;
    }
    updateParticipantGoal.mutate(
      { challengeId, goals: validGoals },
      {
        onSuccess: () => {
          setShowEditGoalModal(false);
          toast.success('목표가 수정되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  const openEditChallengeGoalsModal = (): void => {
    const currentGoals = goals.map((goal) => createGoalEntry(goal.content));
    setChallengeGoalInputs(
      currentGoals.length > 0 ? currentGoals : [createGoalEntry()]
    );
    setShowEditChallengeGoalsModal(true);
  };

  const handleEditChallengeGoalsSubmit = (): void => {
    const validGoals = challengeGoalInputs
      .map((goalInput) => goalInput.value.trim())
      .filter(Boolean);
    if (validGoals.length === 0) {
      toast.error('목표를 최소 1개 이상 입력해 주세요.');
      return;
    }
    updateChallenge.mutate(
      { challengeId, data: { goals: validGoals } },
      {
        onSuccess: () => {
          setShowEditChallengeGoalsModal(false);
          toast.success('챌린지 목표가 수정되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  return {
    showFreeGoalModal,
    setShowFreeGoalModal,
    freeGoalInputs,
    setFreeGoalInputs,
    openFreeGoalModal,
    handleFreeGoalSubmit,
    showEditGoalModal,
    setShowEditGoalModal,
    editGoalInputs,
    setEditGoalInputs,
    openEditGoalModal,
    handleEditGoalSubmit,
    showEditChallengeGoalsModal,
    setShowEditChallengeGoalsModal,
    challengeGoalInputs,
    setChallengeGoalInputs,
    createGoalEntry,
    openEditChallengeGoalsModal,
    handleEditChallengeGoalsSubmit,
    isJoinPending: joinChallenge.isPending,
    isUpdateParticipantGoalPending: updateParticipantGoal.isPending,
    isUpdateChallengePending: updateChallenge.isPending,
  };
}
