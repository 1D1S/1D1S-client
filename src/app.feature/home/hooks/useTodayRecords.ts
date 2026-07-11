'use client';

import { challengeBoardApi } from '@feature/challenge/board/api/challengeBoardApi';
import { CHALLENGE_QUERY_KEYS } from '@feature/challenge/board/consts/queryKeys';
import { challengeDetailApi } from '@feature/challenge/detail/api/challengeDetailApi';
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
  /** 이 챌린지의 목표 목록 (FIXED=공통, FLEXIBLE=내 목표) */
  goals: string[];
  /** 목표(상세) 쿼리가 아직 로딩 중인지 — 스켈레톤 유지용 */
  goalsLoading: boolean;
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

// 진행 중 챌린지별로 "오늘 일지 작성 여부"와 "목표 목록"을 판정한다.
// 사이드바 데이터에는 per-challenge 작성 플래그도 목표도 없어 두 벌의
// 병렬 쿼리를 챌린지 수만큼 돌린다.
//  - check-write(3일 내 작성 날짜 목록): 오늘 날짜 포함 여부로 미작성/완료.
//  - detail(챌린지 상세): challengeGoals 로 목표 목록. FIXED 는 공통 목표,
//    FLEXIBLE 은 서버가 내 목표를 내려준다(일지 작성 체크리스트와 동일 필드).
// 두 쿼리 모두 상세 화면과 동일 키 팩토리를 공유하므로 캐시가 겹친다
// (상세/일지 작성 진입 시 재요청 없음).
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
  const detailResults = useQueries({
    queries: challenges.map((challenge) => ({
      queryKey: CHALLENGE_QUERY_KEYS.detail(challenge.challengeId),
      queryFn: () =>
        challengeDetailApi.getChallengeDetail(challenge.challengeId),
      enabled: Boolean(challenge.challengeId),
    })),
  });

  return useMemo(() => {
    const today = formatDateISO(new Date());
    const items: TodayRecordItem[] = challenges.map((challenge, index) => {
      const result = results[index];
      const detailResult = detailResults[index];
      const dates = result?.data ?? [];
      const goals =
        detailResult?.data?.challengeGoals.map((goal) => goal.content) ?? [];
      return {
        challenge,
        writtenToday: dates.includes(today),
        isLoading: result?.isLoading ?? false,
        goals,
        goalsLoading: detailResult?.isLoading ?? false,
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
  }, [challenges, results, detailResults]);
}
