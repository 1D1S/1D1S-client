'use client';

import { challengeBoardApi } from '@feature/challenge/board/api/challengeBoardApi';
import { CHALLENGE_QUERY_KEYS } from '@feature/challenge/board/consts/queryKeys';
import type { SidebarChallenge } from '@feature/member/type/member';
import { formatDateISO } from '@module/utils/date';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

export interface TodayRecordItem {
  challenge: SidebarChallenge;
  /** 오늘 이 챌린지에 일지를 작성했는지 (해당 쿼리 확정 후에만 유효) */
  writtenToday: boolean;
  /** 이 챌린지의 check-write 쿼리가 아직 로딩 중인지 */
  isLoading: boolean;
}

export interface TodayRecordsResult {
  /** 입력 순서를 보존한 항목들 */
  items: TodayRecordItem[];
  /** 오늘 작성 완료한 챌린지 수 (확정된 것만) */
  doneCount: number;
  /** 오늘 미작성 챌린지 수 (확정된 것만) */
  pendingCount: number;
  /** 하나라도 로딩 중 */
  isLoading: boolean;
  /** 모든 check-write 쿼리가 확정됨 */
  allResolved: boolean;
}

// 진행 중 챌린지별로 "오늘 일지 작성 여부"를 판정한다. 사이드바 데이터에는
// per-challenge 작성 플래그가 없어, 챌린지 상세와 동일한 check-write 엔드포인트
// (3일 내 작성 날짜 목록)를 챌린지 수만큼 병렬 조회해 오늘 날짜 포함 여부로
// 미작성/완료를 가른다. 쿼리 키는 상세 화면과 동일 팩토리를 공유하므로 캐시가
// 겹친다(상세 진입 시 재요청 없음).
export function useTodayRecords(
  challenges: SidebarChallenge[]
): TodayRecordsResult {
  const results = useQueries({
    queries: challenges.map((challenge) => ({
      queryKey: CHALLENGE_QUERY_KEYS.checkWrite(challenge.challengeId),
      queryFn: () =>
        challengeBoardApi.getChallengeCheckWriteDates(challenge.challengeId),
      enabled: Boolean(challenge.challengeId),
    })),
  });

  return useMemo(() => {
    const today = formatDateISO(new Date());
    const items: TodayRecordItem[] = challenges.map((challenge, index) => {
      const result = results[index];
      const dates = result?.data ?? [];
      return {
        challenge,
        writtenToday: dates.includes(today),
        isLoading: result?.isLoading ?? false,
      };
    });
    const resolved = items.filter((item) => !item.isLoading);
    return {
      items,
      doneCount: resolved.filter((item) => item.writtenToday).length,
      pendingCount: resolved.filter((item) => !item.writtenToday).length,
      isLoading: results.some((result) => result.isLoading),
      allResolved: results.every((result) => !result.isLoading),
    };
  }, [challenges, results]);
}
