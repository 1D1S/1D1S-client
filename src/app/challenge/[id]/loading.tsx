import { ChallengeDetailSkeleton } from '@feature/challenge/detail/components/ChallengeDetailSkeleton';
import React from 'react';

/**
 * 상세 진입은 이 스켈레톤 → SSR 프리뷰(제목·기간·소개) → 실화면 3단계다.
 * 첫 단계가 펄스하면 뒤 두 단계가 이어지며 "화면이 반짝인다"로 읽힌다.
 * data-skeleton-static 으로 애니메이션만 끄고 자리 예약은 그대로 둔다.
 */
export default function ChallengeDetailLoading(): React.ReactElement {
  return (
    <div data-native-hide data-skeleton-static className="contents">
      <ChallengeDetailSkeleton />
    </div>
  );
}
