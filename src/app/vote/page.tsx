import { VoteSheetScreen } from '@feature/vote/screen/VoteSheetScreen';
import React from 'react';

export const metadata = {
  title: '오늘의 투표 | 1Day 1Streak',
};

/**
 * 네이티브 바텀시트가 웹뷰로 여는 투표 단독 라우트.
 *
 * 앱은 `/vote?sheet=1` 로 로드한다. `sheet` 파라미터는 앱이 시트로 띄웠음을
 * 나타내는 표식일 뿐, 웹 렌더는 동일하다 — 브라우저로 직접 열어도 같은
 * 화면이 나온다(디버깅·폴백 용도).
 */
export default function VotePage(): React.ReactElement {
  return <VoteSheetScreen />;
}
