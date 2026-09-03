import type { ChallengeCardProps } from '@component/cards/ChallengeCard';
import { getCategoryLabel } from '@constants/categories';

import { getDdayLabel } from '../../detail/utils/challengeLabels';
import type { ChallengeType } from '../type/challenge';
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
export interface ChallengeCardSource {
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
}

/** resolveChallengeCardStatus 가 요구하는 최소 형태로 좁힌다. */
function toStatusInput(challenge: ChallengeCardSource): {
  startDate: string;
  endDate: string;
  participantCnt: number;
  challengeType?: ChallengeType | null;
} {
  return {
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    participantCnt: challenge.participantCnt ?? 0,
    challengeType: challenge.challengeType,
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

export function challengeStatusLabel(
  challenge: ChallengeCardSource,
  now = new Date()
): string {
  const { status } = resolveChallengeCardStatus(toStatusInput(challenge), now);
  if (status === 'ENDED') {
    return '종료됨';
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
      return '모집 중';
    }
    if (days > RELATIVE_START_LIMIT_DAYS) {
      return `${start.getMonth() + 1}.${start.getDate()} 시작`;
    }
    return `${days}일 뒤 (${WEEKDAY_GLYPHS[start.getDay()]}) 시작`;
  }
  // 앱은 D-N 으로 적는다("4일 남음" 아님) — 같은 챌린지가 두 곳에서 다르게
  // 읽히지 않도록 형식을 맞춘다.
  const dday = isInfiniteChallengeEndDate(challenge.endDate)
    ? ''
    : getDdayLabel(challenge.endDate);
  return dday ? `진행 중 · ${dday}` : '진행 중';
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
    statusLabel: challengeStatusLabel(challenge, now),
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
    // 호스트·책은 목록 응답에 아직 없다. 서버가 실어 주면 여기만 채우면 된다
    // (카드는 이미 자리를 그린다).
    host: null,
    book: null,
  };
}
