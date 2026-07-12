'use client';

import type { SidebarChallenge } from '@feature/member/type/member';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { homeApi } from '../api/homeApi';
import { HOME_QUERY_KEYS } from '../consts/homeQueryKeys';
import type { MyTodayChallenge } from '../type/todayChallenge';

export interface TodayRecordItem {
  challenge: SidebarChallenge;
  /** 오늘(KST) 이 챌린지에 일지를 작성했는지 */
  writtenToday: boolean;
  /** 이 챌린지의 목표 목록 (FIXED=공통, FLEXIBLE=내 목표) */
  goals: string[];
}

export interface TodayRecordsResult {
  /** 진행 중 챌린지(서버 판정) — 표시 순서 = 응답 순서 */
  items: TodayRecordItem[];
  /** 오늘 작성 완료한 챌린지 수 */
  doneCount: number;
  /** 오늘 미작성 챌린지 수 */
  pendingCount: number;
  /** today 쿼리가 아직 로딩 중인지 */
  isLoading: boolean;
}

// 새 API에 없는 카드 보조 정보(카테고리·기간·목표유형)는 사이드바에 조인해
// 채운다. 사이드바에 없는 항목(정상 케이스엔 없음)은 보조 정보를 생략한 최소
// 카드로 렌더한다.
function fallbackChallenge(today: MyTodayChallenge): SidebarChallenge {
  return {
    challengeId: today.challengeId,
    title: today.title,
    category: '',
    startDate: '',
    endDate: '',
    maxParticipantCnt: 0,
    goalType: '',
    participationType: '',
    participantCnt: 0,
    likeInfo: { likedByMe: false, likeCnt: 0 },
  };
}

// 진행 중 챌린지의 "오늘 작성 여부 + 목표 목록"을 단일 API로 조회한다.
// 서버가 진행 중 챌린지만 내려주므로(없으면 []), 이 목록이 표시 대상 기준이다.
// 예전엔 챌린지마다 check-write + 상세를 각각 호출해 2N 요청이 났다.
export function useTodayRecords(
  sidebarChallenges: SidebarChallenge[]
): TodayRecordsResult {
  const { data, isLoading } = useQuery({
    queryKey: HOME_QUERY_KEYS.todayChallenges(),
    queryFn: homeApi.getMyTodayChallenges,
  });

  return useMemo(() => {
    const byId = new Map(
      sidebarChallenges.map((challenge) => [challenge.challengeId, challenge])
    );
    const items: TodayRecordItem[] = (data ?? []).map((today) => ({
      challenge: byId.get(today.challengeId) ?? fallbackChallenge(today),
      writtenToday: today.todayWritten,
      goals: today.goals.map((goal) => goal.content),
    }));
    return {
      items,
      doneCount: items.filter((item) => item.writtenToday).length,
      pendingCount: items.filter((item) => !item.writtenToday).length,
      isLoading,
    };
  }, [data, sidebarChallenges, isLoading]);
}
