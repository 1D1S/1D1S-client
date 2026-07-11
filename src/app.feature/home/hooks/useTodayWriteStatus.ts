'use client';

import { challengeBoardApi } from '@feature/challenge/board/api/challengeBoardApi';
import { CHALLENGE_QUERY_KEYS } from '@feature/challenge/board/consts/queryKeys';
import type { SidebarChallenge } from '@feature/member/type/member';
import { formatDateISO } from '@module/utils/date';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

export interface TodayWriteStatus {
  /** 오늘 아직 기록하지 않은(진행 중) 챌린지 */
  pending: SidebarChallenge[];
  /** 오늘 기록을 마친 챌린지 수 */
  doneCount: number;
  /** check-write 쿼리 중 하나라도 로딩 중 */
  isLoading: boolean;
}

// 진행 중 챌린지별로 "오늘 일지 작성 여부"를 판정한다. 사이드바 데이터에는
// per-challenge 작성 플래그가 없어, 챌린지 상세와 동일한 check-write 엔드포인트
// (3일 내 작성 날짜 목록)를 챌린지 수만큼 병렬 조회해 오늘 날짜 포함 여부로
// 미작성/완료를 가른다. 쿼리 키는 상세 화면과 동일 팩토리를 공유하므로 캐시가
// 겹친다(상세 진입 시 재요청 없음).
export function useTodayWriteStatus(
  challenges: SidebarChallenge[]
): TodayWriteStatus {
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
    const pending: SidebarChallenge[] = [];
    let doneCount = 0;
    challenges.forEach((challenge, index) => {
      const dates = results[index]?.data ?? [];
      if (dates.includes(today)) {
        doneCount += 1;
      } else {
        pending.push(challenge);
      }
    });
    return {
      pending,
      doneCount,
      isLoading: results.some((result) => result.isLoading),
    };
  }, [challenges, results]);
}
