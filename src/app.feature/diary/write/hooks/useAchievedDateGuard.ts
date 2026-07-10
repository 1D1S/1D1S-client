import { formatDateISO } from '@module/utils/date';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { ChallengeListItem } from '../../../challenge/board/type/challenge';
import {
  getFirstSelectableAchievedDate,
  isSelectableAchievedDate,
} from '../utils/diaryFormHelpers';

interface UseAchievedDateGuardParams {
  isEditMode: boolean;
  selectedChallenge: ChallengeListItem | null;
  disabledAchievedDateKeySet: Set<string>;
}

export interface UseAchievedDateGuardResult {
  achievedDate: Date | undefined;
  setAchievedDate: Dispatch<SetStateAction<Date | undefined>>;
  handleAchievedDateChange(date: Date | undefined): void;
  isAchievedDateDisabled(date: Date): boolean;
}

/**
 * 달성 날짜 선택 상태와 유효성 가드. useDiaryCreateForm 에서 분리했으며
 * 동작은 동일하다 — 선택 챌린지/비활성 날짜 집합이 바뀌면 유효한 날짜로
 * 자동 보정한다(생성 모드 한정).
 */
export function useAchievedDateGuard({
  isEditMode,
  selectedChallenge,
  disabledAchievedDateKeySet,
}: UseAchievedDateGuardParams): UseAchievedDateGuardResult {
  const [achievedDate, setAchievedDate] = useState<Date | undefined>(
    new Date()
  );

  useEffect(() => {
    if (isEditMode || !selectedChallenge) {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (!achievedDate) {
        const firstSelectableDate = getFirstSelectableAchievedDate(
          disabledAchievedDateKeySet,
          selectedChallenge.startDate
        );
        if (firstSelectableDate) {
          setAchievedDate(firstSelectableDate);
        }
        return;
      }

      if (
        !isSelectableAchievedDate(achievedDate, selectedChallenge.startDate) ||
        disabledAchievedDateKeySet.has(formatDateISO(achievedDate))
      ) {
        setAchievedDate(
          getFirstSelectableAchievedDate(
            disabledAchievedDateKeySet,
            selectedChallenge.startDate
          )
        );
      }
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [achievedDate, disabledAchievedDateKeySet, isEditMode, selectedChallenge]);

  const handleAchievedDateChange = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        setAchievedDate(undefined);
        return;
      }

      if (!isSelectableAchievedDate(date, selectedChallenge?.startDate)) {
        return;
      }

      if (disabledAchievedDateKeySet.has(formatDateISO(date))) {
        return;
      }

      setAchievedDate(date);
    },
    [disabledAchievedDateKeySet, selectedChallenge?.startDate]
  );

  const isAchievedDateDisabled = useCallback(
    (date: Date) =>
      !isSelectableAchievedDate(date, selectedChallenge?.startDate) ||
      disabledAchievedDateKeySet.has(formatDateISO(date)),
    [disabledAchievedDateKeySet, selectedChallenge?.startDate]
  );

  return {
    achievedDate,
    setAchievedDate,
    handleAchievedDateChange,
    isAchievedDateDisabled,
  };
}
