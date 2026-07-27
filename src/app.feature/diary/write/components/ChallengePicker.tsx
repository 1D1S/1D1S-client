'use client';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Icon,
  Text,
} from '@1d1s/design-system';
import {
  CategoryIcon,
  getCategoryIconName,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import {
  isChallengeEndedOrArchived,
  isChallengeOngoing,
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challengePeriod';
import { ChallengeListItem } from '@feature/challenge/shared/components/ChallengeListItem';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import { cn } from '@module/utils/cn';
import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import {
  isNativeModalAvailable,
  openNativeModal,
} from '@module/utils/nativeBridge';
import { useEffect, useMemo, useRef } from 'react';

import type { ChallengeListItem as ChallengeListItemType } from '../../../challenge/board/type/challenge';

interface ChallengePickerProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  challenges: ChallengeListItemType[];
  isLoading?: boolean;
  onSelect?(challenge: ChallengeListItemType): void;
}

export function ChallengePicker({
  open,
  onOpenChange,
  challenges,
  isLoading = false,
  onSelect,
}: ChallengePickerProps): React.ReactElement | null {
  const ongoingChallenges = useMemo(
    () =>
      challenges.filter((challenge) =>
        isChallengeOngoing(challenge.startDate, challenge.endDate)
      ),
    [challenges]
  );
  const nativeModalAvailable = isNativeModalAvailable();
  const nativeRequestInFlight = useRef(false);

  useEffect(() => {
    if (!open) {
      nativeRequestInFlight.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (
      !open ||
      isLoading ||
      !nativeModalAvailable ||
      nativeRequestInFlight.current
    ) {
      return;
    }
    nativeRequestInFlight.current = true;
    const buttons =
      ongoingChallenges.length === 0
        ? [{ label: '확인', value: 'cancel', style: 'cancel' as const }]
        : [
            ...ongoingChallenges.map((challenge) => ({
              label: challenge.title,
              value: String(challenge.challengeId),
              style: 'default' as const,
            })),
            { label: '취소', value: 'cancel', style: 'cancel' as const },
          ];

    void openNativeModal({
      title: '챌린지 선택',
      message:
        ongoingChallenges.length === 0
          ? '작성 가능한 진행 중 챌린지가 없어요.'
          : '일지를 기록할 챌린지를 선택해 주세요.',
      buttons,
      // 네이티브가 아래 ChallengeListItem(variant="picker") 카드를 그대로 그릴
      // 수 있도록 같은 값을 라벨로 완성해 넘긴다. 선택 결과는 challengeId
      // 문자열로 resolve(buttons.value 동일).
      //
      // 라벨을 완성해서 보내는 이유: 날짜 구간(무한 챌린지)·참여 인원 표기를
      // Dart 에서 다시 조립하면 두 구현이 갈린다. 포맷 권위는 여기 한 곳.
      challenges: ongoingChallenges.map((challenge) => {
        const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
        const isEnded = isChallengeEndedOrArchived(
          challenge.endDate,
          challenge.participantCnt,
          challenge.challengeType
        );
        const isOngoing = isChallengeOngoing(
          challenge.startDate,
          challenge.endDate
        );
        // ChallengeListItem 과 동일한 판정 순서 — 무한 챌린지는 조기 종료만
        // 종료로 본다.
        const hasEnded = isInfinite ? false : isEnded;
        return {
          challengeId: challenge.challengeId,
          title: challenge.title,
          // 백엔드가 raw 키(challenge/xxx.jpg)를 주면 앱의 Image.network 가
          // 그리지 못해 플레이스홀더만 보인다. 웹 카드와 같은 변환을 태운다.
          thumbnailUrl: resolveDiaryImageUrl(challenge.thumbnailImage),
          categoryLabel: getCategoryLabel(challenge.category),
          categoryTone: getCategoryStripeTone(challenge.category),
          categoryIconName: getCategoryIconName(challenge.category),
          statusLabel: hasEnded ? '종료됨' : isOngoing ? '진행 중' : '모집 중',
          goalLabel: formatChallengeTypeLabel(challenge.goalType),
          dateLabel: isInfinite
            ? `${challenge.startDate} · 무한`
            : `${challenge.startDate} ~ ${challenge.endDate}`,
          participantLabel:
            challenge.maxParticipantCnt <= 1
              ? null
              : `${challenge.participantCnt}/${challenge.maxParticipantCnt}명 참여중`,
        };
      }),
    }).then((value) => {
      const selected = ongoingChallenges.find(
        (challenge) => String(challenge.challengeId) === value
      );
      if (selected) {
        onSelect?.(selected);
      }
      onOpenChange(false);
    });
  }, [
    isLoading,
    nativeModalAvailable,
    onOpenChange,
    onSelect,
    ongoingChallenges,
    open,
  ]);

  if (nativeModalAvailable) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        className="max-h-[85dvh]"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>챌린지 선택</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex min-h-0 flex-1 flex-col">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <span
                className={cn('bg-main-100 h-9 w-9 animate-pulse rounded-full')}
              />
              <Text size="body2" className="text-gray-500">
                불러오는 중입니다...
              </Text>
            </div>
          ) : ongoingChallenges.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <span
                className={cn(
                  'bg-main-100 text-main-800 flex h-10 w-10 items-center',
                  'justify-center rounded-full'
                )}
              >
                <Icon name="Flag" size={18} />
              </span>
              <Text size="body2" weight="bold" className="text-gray-700">
                작성 가능한 진행 중 챌린지가 없어요
              </Text>
              <Text size="caption2" className="text-gray-500">
                새 챌린지에 참여하거나 모집 중 챌린지를 기다려보세요.
              </Text>
            </div>
          ) : (
            <div
              className={cn(
                'flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1'
              )}
            >
              {ongoingChallenges.map((challenge) => (
                <ChallengeListItem
                  key={challenge.challengeId}
                  challengeTitle={challenge.title}
                  challengeType={formatChallengeTypeLabel(challenge.goalType)}
                  challengeCategory={getCategoryLabel(challenge.category)}
                  categoryIcon={<CategoryIcon category={challenge.category} />}
                  imageUrl={challenge.thumbnailImage}
                  currentUserCount={challenge.participantCnt}
                  maxUserCount={challenge.maxParticipantCnt}
                  startDate={challenge.startDate}
                  endDate={challenge.endDate}
                  isInfiniteChallenge={isInfiniteChallengeEndDate(
                    challenge.endDate
                  )}
                  isOngoing={isChallengeOngoing(
                    challenge.startDate,
                    challenge.endDate
                  )}
                  isEnded={isChallengeEndedOrArchived(
                    challenge.endDate,
                    challenge.participantCnt,
                    challenge.challengeType
                  )}
                  stripeTone={getCategoryStripeTone(challenge.category)}
                  variant="picker"
                  onClick={() => {
                    onSelect?.(challenge);
                    onOpenChange(false);
                  }}
                />
              ))}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
