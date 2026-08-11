export type VoteSelectionType = 'SINGLE' | 'MULTIPLE';
export type VoteType = 'PUBLIC' | 'ADMIN_SURVEY';

export interface VoteSummary {
  id: number;
  title: string;
  selectionType: VoteSelectionType;
  voteType: VoteType;
  startDate: string;
  endDate: string;
  voted: boolean;
  // 노출 대상(audience) 필터는 서버가 로그인 회원 기준으로 이미 적용해서
  // 내려준다 — 받은 목록은 전부 노출 대상이라 웹은 표시 판단에 쓰지 않는다.
  // 값 목록을 여기서 좁히면 서버가 종류를 늘릴 때 타입만 깨지므로 열어 둔다.
  audience?: string;
  targetChallengeId?: number | null;
}

export interface VoteOption {
  optionId: number;
  text: string;
  percentage?: number;
}

export interface VoteDetail extends VoteSummary {
  options: VoteOption[];
  // 내가 고른 optionId 들. 미응답·비로그인이면 []. 목록(VoteSummary)에는
  // 없고 상세·제출/재투표 응답에만 실린다. 구버전 서버 대비 옵셔널.
  myOptionIds?: number[];
}

export interface VoteSubmitRequest {
  optionIds: number[];
}
