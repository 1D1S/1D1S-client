import type { LikeInfo } from '@module/api/types';

export type { LikeInfo };

export type ChallengeCategory =
  | 'ALL'
  | 'DEV'
  | 'EXERCISE'
  | 'BOOK'
  | 'MUSIC'
  | 'STUDY'
  | 'LEISURE'
  | 'ECONOMY';
export type GoalType = 'FIXED' | 'FLEXIBLE';
export type ParticipationType = 'INDIVIDUAL' | 'GROUP';
export type ParticipantStatus =
  | 'NONE'
  | 'PENDING'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'HOST'
  | 'PARTICIPANT';

export interface RandomParticipant {
  memberId: number;
  nickname: string;
  profileImg: string | null;
}

export interface ChallengeSummary {
  challengeId: number;
  title: string;
  category: ChallengeCategory;
  startDate: string;
  endDate: string;
  maxParticipantCnt: number;
  goalType: GoalType;
  participationType: ParticipationType;
  participantCnt: number;
  likeInfo: LikeInfo;
  thumbnailImage?: string | null;
  deleted?: boolean;
  randomParticipants?: RandomParticipant[];
}

export interface ChallengeListItem {
  challengeId: number;
  title: string;
  category: ChallengeCategory;
  startDate: string;
  endDate: string;
  maxParticipantCnt: number;
  goalType: GoalType;
  participationType: ParticipationType;
  participantCnt: number;
  liked: boolean;
  likeCnt: number;
  thumbnailImage?: string;
  randomParticipants?: RandomParticipant[];
}

export interface ChallengeDetail {
  description: string;
  allowMidJoin?: boolean;
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
  maxParticipantCnt: number | null;
  goalType: GoalType;
  participationType: ParticipationType;
  goals: string[];
  allowMidJoin: boolean;
  thumbnailImage?: string;
}

// 변경할 필드만 포함 (생략 시 기존 값 유지, null 명시 시 삭제)
export interface UpdateChallengeRequest {
  title?: string;
  thumbnailImage?: string | null;
  category?: ChallengeCategory;
  description?: string;
  allowMidJoin?: boolean;
  maxParticipantCnt?: number;
  goals?: string[];
}

export interface CreateChallengeResponse {
  challengeId: number;
  title: string;
  category: ChallengeCategory;
  startDate: string;
  endDate: string;
  maxParticipantCnt: number;
  goalType: GoalType;
  participationType: ParticipationType;
  participantCnt: number;
  likeInfo: LikeInfo;
}

export type JoinChallengeRequest = string[];

export interface JoinChallengeResponse {
  memberId: number;
  participantId: number;
  nickname: string;
  profileImg: string;
  status: ParticipantStatus;
}

// 챌린지원 찌르기 — 오늘 일지를 쓰지 않은 챌린지원에게 알림 전송
export interface PokeChallengeRequest {
  receiverMemberIds: number[];
}

export interface PokeChallengeResponse {
  // 실제로 찌르기 알림이 전송된 챌린지원 ID 목록
  pokedMemberIds: number[];
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
  category?: Exclude<ChallengeCategory, 'ALL'>;
}

export interface RandomChallengesParams {
  size?: number;
}

export interface MemberChallengesParams {
  memberId: number;
}
