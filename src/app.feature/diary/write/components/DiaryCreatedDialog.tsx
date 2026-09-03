'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Flame } from 'lucide-react';
import React from 'react';

/**
 * 색종이 한 조각의 궤적. 앱 AppConfetti 와 같은 인상 —
 * 위로 퍼지는 부채꼴 + 중력, 24조각, 1100ms, 한 번만.
 *
 * 값은 **고정 배열**이다. Math.random() 을 쓰면 SSR 과 클라가 다른 값을
 * 뽑아 하이드레이션이 깨진다. 어차피 한 번 터지고 사라지는 연출이라
 * 매번 달라야 할 이유도 없다.
 */
const CONFETTI_PIECES = Array.from({ length: 24 }, (_unused, index) => {
  // 위쪽 부채꼴(-160°~-20°)로 고르게 펼친다.
  const angle = (-160 + (140 / 23) * index) * (Math.PI / 180);
  // 조각마다 거리를 달리해 한 덩어리로 안 보이게 한다.
  const reach = 120 + ((index * 37) % 90);
  return {
    dx: Math.cos(angle) * reach,
    // 중력 — 위로 던졌다가 아래로 끌린다.
    dy: Math.sin(angle) * reach + 220,
    rot: ((index * 53) % 720) - 360,
    delay: (index * 7) % 160,
    left: 8 + ((index * 17) % 84),
    color: [
      'bg-main-800',
      'bg-main-600',
      'bg-mint-900',
      'bg-blue-600',
      'bg-red-500',
    ][index % 5],
  };
});

/**
 * 축하 색종이. 카드 **뒤**에 깔린다 — 위에 얹으면 글자와 버튼을 가린다.
 * 입력을 먹지 않게 pointer-events 를 끈다(축하가 버튼을 막으면 사고다).
 */
function Confetti(): React.ReactElement {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {CONFETTI_PIECES.map((piece, index) => (
        <span
          key={index}
          className={cn(
            'animate-confetti-piece absolute top-[28%] h-2 w-1.5 rounded-[1.5px]',
            piece.color
          )}
          style={
            {
              left: `${piece.left}%`,
              '--dx': `${piece.dx}px`,
              '--dy': `${piece.dy}px`,
              '--rot': `${piece.rot}deg`,
              '--delay': `${piece.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** 스트릭이 오른 날 배지 — 브랜드 원 + 불꽃. */
function CelebrationBadge(): React.ReactElement {
  return (
    <div
      className={cn(
        'bg-brand animate-celebrate-pop flex h-20 w-20 items-center',
        'justify-center rounded-full'
      )}
    >
      <Flame className="h-10 w-10 text-white" aria-hidden />
    </div>
  );
}

/**
 * 평범한 완료 배지. 챌린지 만들기 완료 모달과 **같은 그림**을 쓴다 —
 * 앱도 두 완료 모달이 같은 카드를 공유한다(계약 HC).
 */
function CheckBadge(): React.ReactElement {
  return (
    <div
      className={cn(
        'bg-main-900 flex h-20 w-20 items-center justify-center',
        'rounded-full'
      )}
    >
      <svg
        viewBox="0 0 40 40"
        className="h-12 w-12"
        fill="none"
        aria-label="success"
        role="img"
      >
        <path
          d="M9 21 L17 29"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className="animate-draw-check-1"
        />
        <path
          d="M17 29 L32 12"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className="animate-draw-check-2"
        />
      </svg>
    </div>
  );
}

/** "스트릭 N일 달성!" — 숫자가 주인공이다(앱 _StreakTitle 과 같은 규칙). */
function StreakTitle({ days }: { days: number }): React.ReactElement {
  return (
    <Text size="heading1" weight="bold" className="text-center text-black">
      스트릭{' '}
      <span className="text-brand text-[2em] leading-none font-extrabold">
        {days}
      </span>
      일 달성!
    </Text>
  );
}

export interface DiaryCreatedDialogProps {
  open: boolean;
  /**
   * 이번 일지로 스트릭이 올라갔는가. **서버에서 온 값으로 판정한다** —
   * "오늘 첫 작성인가" 로 흉내 내면 틀린다(스트릭은 achievedDate 기준에
   * 유예가 붙어, 며칠 전 날짜로 쓴 일지도 스트릭을 바꾼다).
   */
  streakIncreased: boolean;
  streakDays: number;
  /** 생성 응답에 id 가 없으면 보러 갈 수 없다 — 돌아가기만 남긴다. */
  canViewDiary: boolean;
  onViewDiary(): void;
  onBack(): void;
}

/**
 * 일지 작성 완료 모달(계약 HC). 앱 showDiaryCreatedModal 과 같은 분기·문구.
 *
 * 분기는 **스트릭이 이번 일지로 올라갔는지** 하나다. 올랐으면 축하(연속
 * 일수 + 색종이), 아니면 담백한 완료. 매번 터지면 축하가 축하가 아니다.
 *
 * 바깥을 눌러 닫으면 '돌아가기'와 같게 다룬다(앱과 동일).
 */
export function DiaryCreatedDialog({
  open,
  streakIncreased,
  streakDays,
  canViewDiary,
  onViewDiary,
  onBack,
}: DiaryCreatedDialogProps): React.ReactElement {
  // 일수를 모르면 숫자 없는 쪽으로 간다 — 틀린 숫자를 띄우느니(앱과 동일).
  const celebrate = streakIncreased && streakDays > 0;

  const viewButton = (
    <Button
      // 스트릭을 올린 날은 방금 쓴 일지를 보러 가는 쪽이 주 동선이다.
      variant={celebrate ? 'primary' : 'secondary'}
      type="button"
      onClick={onViewDiary}
    >
      일지 보기
    </Button>
  );
  const backButton = (
    <Button
      variant={celebrate ? 'secondary' : 'primary'}
      type="button"
      onClick={onBack}
    >
      돌아가기
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onBack()}>
      <DialogContent
        className={cn(
          // position 유틸을 덧붙이지 않는다. DialogContent 는 자기
          // 기본값으로 `fixed top-1/2 left-1/2` 로 화면 중앙에 선다.
          // 여기에 `relative` 같은 걸 얹으면 tailwind-merge 가 같은
          // position 그룹으로 보고 `fixed` 를 지워 — 모달이 문서 흐름에
          // 놓여 페이지 맨 아래에 뜬다. 색종이의 `absolute` 는 `fixed`
          // 조상만으로 이미 자리를 잡는다.
          'flex flex-col items-center gap-6',
          'px-6 pt-10 pb-6 sm:min-w-120',
          '[&>button:last-of-type]:hidden'
        )}
        aria-describedby={undefined}
      >
        {celebrate ? <Confetti /> : null}
        {/* 카드 내용은 색종이 위에 선다. */}
        <DialogHeader className="relative z-10 items-center">
          <DialogTitle>
            <DialogDescription>
              {celebrate ? (
                <StreakTitle days={streakDays} />
              ) : (
                <Text
                  size="heading1"
                  weight="bold"
                  className="text-center text-black"
                >
                  일지 작성 완료
                </Text>
              )}
            </DialogDescription>
          </DialogTitle>
        </DialogHeader>

        <div className="relative z-10">
          {celebrate ? <CelebrationBadge /> : <CheckBadge />}
        </div>

        <Text
          size="caption1"
          weight="regular"
          className="relative z-10 block text-center text-gray-500"
        >
          {celebrate
            ? '오늘도 기록을 이어갔어요. 내일도 만나요!'
            : '오늘의 기록을 저장했어요.'}
        </Text>

        <div
          className={cn(
            'relative z-10 grid w-full gap-3',
            canViewDiary ? 'grid-cols-2' : 'grid-cols-1'
          )}
        >
          {!canViewDiary ? (
            backButton
          ) : celebrate ? (
            <>
              {backButton}
              {viewButton}
            </>
          ) : (
            <>
              {viewButton}
              {backButton}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
