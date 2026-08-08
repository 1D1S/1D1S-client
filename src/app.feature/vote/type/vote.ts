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
}

export interface VoteOption {
  optionId: number;
  text: string;
  percentage?: number;
}

export interface VoteDetail extends VoteSummary {
  options: VoteOption[];
}

export interface VoteSubmitRequest {
  optionIds: number[];
}
