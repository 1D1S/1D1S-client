import { useRandomChallenges } from '@feature/challenge/board/hooks/use-challenge-queries';
import { type ChallengeListItem } from '@feature/challenge/board/type/challenge';
import { useRandomDiaries } from '@feature/diary/board/hooks/use-diary-queries';
import { type DiaryItem } from '@feature/diary/board/type/diary';
import { normalizeApiError } from '@module/api/error';

interface UseHomeRandomDataResult {
  randomChallenges: ChallengeListItem[];
  isChallengesLoading: boolean;
  isChallengesError: boolean;
  challengesErrorMessage: string | null;
  randomDiaries: DiaryItem[];
  isDiariesLoading: boolean;
  isDiariesError: boolean;
  diariesErrorMessage: string | null;
}

export function useHomeRandomData(): UseHomeRandomDataResult {
  const {
    data: randomChallenges = [],
    isLoading: isChallengesLoading,
    isError: isChallengesError,
    error: challengesError,
  } = useRandomChallenges({ size: 4 });

  const {
    data: randomDiaries = [],
    isLoading: isDiariesLoading,
    isError: isDiariesError,
    error: diariesError,
  } = useRandomDiaries({ size: 12 });

  return {
    randomChallenges,
    isChallengesLoading,
    isChallengesError,
    challengesErrorMessage: challengesError
      ? normalizeApiError(challengesError).message
      : null,
    randomDiaries,
    isDiariesLoading,
    isDiariesError,
    diariesErrorMessage: diariesError
      ? normalizeApiError(diariesError).message
      : null,
  };
}
