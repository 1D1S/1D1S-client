import { useChallengeList } from '@feature/challenge/board/hooks/useChallengeQueries';
import { type ChallengeListItem } from '@feature/challenge/board/type/challenge';
import { isChallengeEnded } from '@feature/challenge/board/utils/challengePeriod';
import { normalizeApiError } from '@module/api/error';

// 첫 페이지만 노출하는 가로 스크롤 섹션이라 무한 스크롤 없이 limit 만큼만 받는다.
const OFFICIAL_CHALLENGES_LIMIT = 10;

interface OfficialChallengesResult {
  officialChallenges: ChallengeListItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

// 공식 챌린지(OFFICIAL) 목록 — 전용 엔드포인트가 없어 챌린지 목록 API의
// challengeType 필터를 재사용한다(보드의 "공식 운영" 필터와 동일 경로).
export function useExploreOfficialChallenges(): OfficialChallengesResult {
  const { data, isLoading, isError, error } = useChallengeList({
    challengeType: 'OFFICIAL',
    limit: OFFICIAL_CHALLENGES_LIMIT,
  });

  // 진행/진행예정인 공식 챌린지만 노출 — 이미 종료된 건 제외한다.
  // (참여자 0명은 신규 예정 챌린지일 수 있어 endDate 기준으로만 판정한다.)
  const officialChallenges = (
    data?.pages.flatMap((page) => page.items) ?? []
  ).filter((challenge) => !isChallengeEnded(challenge.endDate));

  return {
    officialChallenges,
    isLoading,
    isError,
    errorMessage: error ? normalizeApiError(error).message : null,
  };
}
