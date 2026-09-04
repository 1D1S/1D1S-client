import type { ChallengeCardProps } from '@component/cards/ChallengeCard';
import { getCategoryLabel } from '@constants/categories';

import { getDdayLabel } from '../../detail/utils/challengeLabels';
import type {
  ChallengeCardExtras,
  ChallengeOccurrence,
  ChallengeType,
  OccurrencePhase,
} from '../type/challenge';
import {
  isInfiniteChallengeEndDate,
  resolveChallengeCardStatus,
} from './challengePeriod';

/**
 * 카드가 필요로 하는 것만 추린 입력.
 *
 * 목록(ChallengeListItem)·상세 요약(ChallengeSummary)·마이페이지 응답이
 * 각각 조금씩 다른 타입인데 카드가 쓰는 필드는 같다. 교집합을 여기 한 번
 * 적어 두면 화면마다 변환을 다시 쓰지 않아도 된다.
 */
export interface ChallengeCardSource extends ChallengeCardExtras {
  title: string;
  category?: string | null;
  startDate: string;
  endDate: string;
  participationType?: string | null;
  thumbnailImage?: string | null;
  participantCnt?: number;
  maxParticipantCnt?: number | null;
  photoRequired?: boolean;
  challengeType?: ChallengeType | null;
  weeklyGoalCount?: number;
  hasReward?: boolean;
  allowMidJoin?: boolean;
  likeInfo?: { likedByMe: boolean; likeCnt: number };
}

/** resolveChallengeCardStatus 가 요구하는 최소 형태로 좁힌다. */
function toStatusInput(challenge: ChallengeCardSource): {
  startDate: string;
  endDate: string;
  participantCnt: number;
  challengeType?: ChallengeType | null;
  occurrencePhase?: OccurrencePhase | null;
  occurrenceStatus?: string | null;
} {
  return {
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    participantCnt: challenge.participantCnt ?? 0,
    challengeType: challenge.challengeType,
    occurrencePhase: challenge.occurrencePhase,
    occurrenceStatus: challenge.occurrenceStatus,
  };
}

/**
 * 목록 응답 한 건 → 챌린지 카드 props.
 *
 * 카드를 쓰는 곳이 여섯 군데라, 매핑을 각 화면에 두면 라벨 규칙이 조금씩
 * 갈린다(실제로 갈려 있었다). 앱은 카드에 item 하나를 넘기는데, 웹은
 * 프레젠테이션 컴포넌트를 유지하되 변환을 여기 하나로 모은다.
 *
 * 라벨 문구는 앱 `challenge_board_api.dart` 의 헬퍼를 그대로 옮겼다 —
 * 한쪽만 바꾸면 같은 챌린지가 앱과 웹에서 다르게 읽힌다.
 */

const ENDLESS_LABEL = '제한 없음';
const WEEKDAY_GLYPHS = ['일', '월', '화', '수', '목', '금', '토'];

/** 주기 — 7회 이상이면 '매일', 아니면 '주 N일'. */
export function challengeCadenceLabel(weeklyGoalCount?: number | null): string {
  const count = weeklyGoalCount ?? 0;
  if (count >= 7 || count <= 0) {
    return '매일';
  }
  return `주 ${count}일`;
}

/** 기간 — 무기한은 '제한 없음', 7의 배수는 '주', 아니면 '일'. */
export function challengeDurationLabel(
  startDate?: string | null,
  endDate?: string | null
): string {
  if (isInfiniteChallengeEndDate(endDate)) {
    return ENDLESS_LABEL;
  }
  if (!startDate || !endDate) {
    return '';
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (!Number.isFinite(days) || days <= 0) {
    return '';
  }
  return days % 7 === 0 ? `${days / 7}주 동안` : `${days}일 동안`;
}

/**
 * 상태 줄 — 종료됨 / N일 뒤 (요일) 시작 / 진행 중 · D-N.
 *
 * 시작일이 일주일을 넘으면 '며칠 뒤'로 세지 않는다(앱과 같은 규칙) —
 * '1223일 뒤 시작'은 세는 말이 아니라 숫자 덩어리다.
 */
const RELATIVE_START_LIMIT_DAYS = 7;

export function challengeStatusPieces(
  challenge: ChallengeCardSource,
  now = new Date()
): string[] {
  const { status } = resolveChallengeCardStatus(toStatusInput(challenge), now);
  if (status === 'ENDED') {
    return ['종료됨'];
  }
  if (status === 'UPCOMING') {
    const start = new Date(challenge.startDate);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const days = Math.round(
      (start.getTime() - startOfToday.getTime()) / 86_400_000
    );
    if (days <= 0) {
      return ['모집 중'];
    }
    const relative =
      days > RELATIVE_START_LIMIT_DAYS
        ? `${start.getMonth() + 1}.${start.getDate()} 시작`
        : `${days}일 뒤 (${WEEKDAY_GLYPHS[start.getDay()]}) 시작`;
    // 모집 중이면 그렇게 말한다 — '3일 뒤 시작' 만 적으면 지금 들어갈 수
    // 있다는 사실(모집창이 열려 있다)이 안 보인다.
    return challenge.occurrencePhase === 'RECRUITING'
      ? ['모집 중', relative]
      : [relative];
  }
  // 앱은 D-N 으로 적는다("4일 남음" 아님).
  const dday = isInfiniteChallengeEndDate(challenge.endDate)
    ? ''
    : getDdayLabel(challenge.endDate, now);
  return [
    '진행 중',
    ...(dday ? [dday] : []),
    // 단체 챌린지만 중도 참여 가부를 말한다 — 개인 챌린지엔 없는 개념이다.
    ...(challenge.participationType === 'GROUP' &&
    challenge.allowMidJoin !== undefined
      ? [challenge.allowMidJoin ? '참여 가능' : '참여 마감']
      : []),
  ];
}

/** 인원 뱃지 — 개인은 '개인', 단체는 'N명' 또는 'N/M명'. */
export function challengeParticipantsLabel(
  challenge: ChallengeCardSource
): string {
  if (challenge.participationType !== 'GROUP') {
    return '개인';
  }
  const count = challenge.participantCnt ?? 0;
  const max = challenge.maxParticipantCnt ?? 0;
  return max > 0 ? `${count}/${max}명` : `${count}명`;
}

/**
 * 만든 사람 — 닉네임이 없으면 그리지 않는다(공식 챌린지는 태그가 대신한다).
 *
 * 레벨은 목록 응답의 `hostLevel` 을 그대로 넘긴다. 젬 자체는 레벨 기능(S3)
 * 몫이지만, 값을 지금 연결해 두면 그때 렌더만 붙이면 된다.
 */
function toCardHost(
  challenge: ChallengeCardSource
): ChallengeCardProps['host'] {
  const nickname = challenge.hostMemberNickname?.trim();
  if (!nickname) {
    return null;
  }
  return {
    nickname,
    profileImg: challenge.hostProfileImage ?? null,
    level: challenge.hostLevel ?? null,
  };
}

/**
 * 대표책 — `bookCount > 0` 일 때만 그린다(독서 카테고리만 채워진다).
 *
 * "외 N권" 의 N 은 대표책을 뺀 나머지다. 카드마다
 * `/challenges/{id}/books` 를 부르지 않으려고 서버가 목록에 실어 준
 * 값이므로, 여기서 개별 조회로 되돌리지 말 것.
 */
function toCardBook(
  challenge: ChallengeCardSource
): ChallengeCardProps['book'] {
  const count = challenge.bookCount ?? 0;
  const title = challenge.representativeBookTitle?.trim();
  if (count <= 0 || !title) {
    return null;
  }
  return {
    title,
    coverUrl: challenge.representativeBookThumbnailUrl ?? null,
    moreCount: count - 1,
  };
}

export function toChallengeCardProps(
  challenge: ChallengeCardSource,
  href: string,
  now?: Date
): ChallengeCardProps {
  const { status } = resolveChallengeCardStatus(toStatusInput(challenge), now);

  return {
    href,
    title: challenge.title,
    category: challenge.category,
    categoryLabel: getCategoryLabel(challenge.category),
    imageUrl: challenge.thumbnailImage ?? null,
    status,
    statusPieces: challengeStatusPieces(challenge, now),
    cadenceLabel: challengeCadenceLabel(challenge.weeklyGoalCount),
    durationLabel: challengeDurationLabel(
      challenge.startDate,
      challenge.endDate
    ),
    participantsLabel: challengeParticipantsLabel(challenge),
    isGroup: challenge.participationType === 'GROUP',
    isPhotoRequired: challenge.photoRequired,
    isOfficial: challenge.challengeType === 'OFFICIAL',
    hasReward: challenge.hasReward,
    // 미리지원 배지 — 서버가 PRE_APPLY 로 판정했을 때만.
    canPreApply: challenge.ctaState === 'PRE_APPLY',
    liked: challenge.likeInfo?.likedByMe ?? false,
    likeCount: challenge.likeInfo?.likeCnt ?? 0,
    host: toCardHost(challenge),
    book: toCardBook(challenge),
  };
}

/**
 * 다음 모집까지 — `다음 모집 D-5 · 10.05 시작`.
 *
 * 날짜를 **읽어 주는 것**이지 판정이 아니다. 참여 가능 여부는 서버가
 * 정하고(phase·ctaState), 이 문구는 그 서버 날짜를 세어 보여 줄 뿐이다.
 */
export function challengeRecruitCountdownLabel(
  recruitStartDate?: string | null,
  now = new Date()
): string {
  if (!recruitStartDate) {
    return '';
  }
  const start = new Date(recruitStartDate);
  if (Number.isNaN(start.getTime())) {
    return '';
  }
  start.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const days = Math.round((start.getTime() - today.getTime()) / 86_400_000);
  const when = `${start.getMonth() + 1}.${start.getDate()}`;
  return days <= 0
    ? `오늘 모집 시작 · ${when}`
    : `다음 모집 D-${days} · ${when} 시작`;
}

/**
 * 다음으로 **모집이 열릴** 회차. 고르기만 한다 — 어느 회차가 모집 중인지는
 * 서버 phase 가 정한다. 모집창 날짜를 비교해 다시 판정하지 않는다.
 */
export function nextRecruitOccurrence(
  occurrences?: ChallengeOccurrence[] | null
): ChallengeOccurrence | null {
  return (
    occurrences?.find(
      (item) => item.phase === 'SCHEDULED' && Boolean(item.recruitStartDate)
    ) ?? null
  );
}
