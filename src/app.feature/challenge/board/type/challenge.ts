export type ChallengeCategory =
  | 'DEV'
  | 'HEALTH'
  | 'STUDY'
  | 'EXERCISE'
  | 'HOBBY'
  | 'OTHER';
export type ChallengeType = 'FIXED' | 'FLEXIBLE';
export type ParticipantStatus =
  | 'NONE'
  | 'PENDING'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'HOST'
  | 'PARTICIPANT';

export interface LikeInfo {
  likedByMe: boolean;
  likeCnt: number;
}

export interface ChallengeSummary {
  challengeId: number;
  title: string;
  category: ChallengeCategory;
  startDate: string;
  endDate: string;
  maxParticipantCnt: number;
  challengeType: ChallengeType;
  participantCnt: number;
  likeInfo: LikeInfo;
}

export interface ChallengeListItem {
  challengeId: number;
  title: string;
  category: ChallengeCategory;
  startDate: string;
  endDate: string;
  maxParticipantCnt: number;
  goalType: ChallengeType;
  participantCnt: number;
  liked: boolean;
  likeCnt: number;
}

export interface ChallengeDetail {
  description: string;
  myStatus: ParticipantStatus;
  participationRate: number;
  goalCompletionRate: number;
}

export interface ChallengeGoal {
  challengeGoalId: number;
  content: string;
}

export interface Participant {
  memberId: number;
  participantId: number;
  nickname: string;
  profileImg: string;
  status: ParticipantStatus;
}

export interface ChallengeDetailResponse {
  challengeSummary: ChallengeSummary;
  challengeDetail: ChallengeDetail;
  challengeGoals: ChallengeGoal[];
  participants: Participant[];
}

export interface CreateChallengeRequest {
  title: string;
  category: ChallengeCategory;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipantCnt: number;
  challengeType: ChallengeType;
  goals: string[];
}

export interface CreateChallengeResponse {
  challengeId: number;
  title: string;
  category: ChallengeCategory;
  startDate: string;
  endDate: string;
  maxParticipantCnt: number;
  challengeType: ChallengeType;
  participantCnt: number;
  likeInfo: LikeInfo;
}

export interface JoinChallengeRequest {
  goals?: string[];
}

export interface JoinChallengeResponse {
  memberId: number;
  participantId: number;
  nickname: string;
  profileImg: string;
  status: ParticipantStatus;
}

export interface ChallengeListResponse {
  items: ChallengeListItem[];
  pageInfo: {
    limit: number;
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

export interface ChallengeListParams {
  limit?: number;
  cursor?: string;
  keyword?: string;
}

export interface RandomChallengesParams {
  size?: number;
}

export interface MemberChallengesParams {
  memberId: number;
}
