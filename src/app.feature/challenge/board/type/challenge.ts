import type { LikeInfo } from '@module/api/types';

export type { LikeInfo };

export type ChallengeCategory =
  | 'ALL'
  | 'DEV'
  | 'EXERCISE'
  | 'BOOK'
  | 'DIET'
  | 'HEALTH'
  | 'HOBBY'
  | 'LANGUAGE'
  | 'SELF_DEV'
  | 'ETC';
export type GoalType = 'FIXED' | 'FLEXIBLE';
export type ParticipationType = 'INDIVIDUAL' | 'GROUP';
// 챌린지 공개 범위 — PUBLIC: 공개, PRIVATE: 비공개(비밀번호), OFFICIAL: 공식
export type ChallengeType = 'PUBLIC' | 'PRIVATE' | 'OFFICIAL';
// 목록 필터로 지정 가능한 종류 — PRIVATE 는 미지정 시에도 서버가 항상 제외
export type ChallengeTypeFilter = Exclude<ChallengeType, 'PRIVATE'>;
// 진행 상태 — UPCOMING: 모집중, ONGOING: 진행중, ENDED: 종료
export type ChallengeStatus = 'UPCOMING' | 'ONGOING' | 'ENDED';
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
  // 종료 후 2일 유예 동안 일지 작성 허용 여부(생성 시 지정).
  postEndWriteAllowed?: boolean;
  // 공개 범위 — OFFICIAL 이면 참여자 0명이어도 종료로 판정하지 않는다.
  // 서버가 상세 응답(challengeSummary)에 항상 내려주므로 필수.
  challengeType: ChallengeType;
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
  // 인증샷(사진) 필수 여부(서버 JSON 키: photoRequired).
  photoRequired?: boolean;
  // 종료 후 2일 유예 동안 일지 작성 허용 여부.
  postEndWriteAllowed?: boolean;
  liked: boolean;
  likeCnt: number;
  // 공개 범위 — OFFICIAL 일 때 카드를 공식 챌린지로 강조한다.
  challengeType?: ChallengeType;
  thumbnailImage?: string;
  randomParticipants?: RandomParticipant[];
}

export interface ChallengeDetail {
  description: string;
  allowMidJoin?: boolean;
  // 인증샷(사진) 필수 여부(서버 JSON 키: photoRequired).
  photoRequired?: boolean;
  // 종료 후 2일 유예 동안 일지 작성 허용 여부.
  postEndWriteAllowed?: boolean;
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
  // 참여자별 목표 — FIXED 는 공통 목표, FLEXIBLE 는 본인이 설정한 목표.
  goals?: ChallengeGoal[];
  // 등수 — 시작 전이거나 순위 산정 대상이 아니면 null.
  rank: number | null;
  // 연속 달성일수 / 완료한 목표 개수
  streak: number;
  completedGoalCount: number;
}

// 참여자 목록 정렬 — 참여순(기본) / 등수순
export type ParticipantSort = 'PARTICIPATION' | 'RANK';

export interface ParticipantListParams {
  sort?: ParticipantSort;
  page?: number;
  size?: number;
  // 상태 필터 (다중). 미지정 시 서버 기본(호스트: 전체 / 그 외: 승인자만).
  status?: ParticipantStatus[];
}

// 오프셋 페이지네이션 공통 페이지 정보 (챌린지 일지 목록과 동일 형태)
export interface OffsetPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ParticipantListResponse {
  items: Participant[];
  pageInfo: OffsetPageInfo;
}

export interface ChallengeDetailResponse {
  challengeSummary: ChallengeSummary;
  challengeDetail: ChallengeDetail;
  challengeGoals: ChallengeGoal[];
  // 챌린지 상세는 등수순 상위 5명만 내려준다(각 항목에 rank 포함).
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
  // 인증샷(사진) 필수 여부(서버 JSON 키: photoRequired, 기본 false).
  photoRequired: boolean;
  // 종료 후 2일 유예 동안 일지 작성 허용 여부(기본 false).
  postEndWriteAllowed: boolean;
  thumbnailImage?: string;
  // 공개 범위. 생성 시 PUBLIC 또는 PRIVATE 를 보낸다.
  challengeType: ChallengeType;
  // PRIVATE 일 때만 동봉하는 참여 비밀번호.
  password?: string;
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

// 비공개 챌린지 비밀번호 검증 후 즉시 참여
// FLEXIBLE 챌린지는 goals 로 본인 목표를 전달, FIXED 는 무시된다.
export interface VerifyChallengePasswordRequest {
  password: string;
  goals?: string[];
}

// 검증 성공 시 참여 정보를 그대로 돌려준다.
export type VerifyChallengePasswordResponse = JoinChallengeResponse;

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
  challengeType?: ChallengeTypeFilter;
  /** 진행 상태 다중 선택 — 빈 배열 대신 undefined 로 전달해야 전체 조회 */
  status?: ChallengeStatus[];
}

export interface RandomChallengesParams {
  size?: number;
}

export interface MemberChallengesParams {
  memberId: number;
}
