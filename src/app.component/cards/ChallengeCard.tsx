'use client';

import { CircleAvatar, Icon } from '@1d1s/design-system';
import FadeInImage from '@component/FadeInImage';
import { CategoryIcon, getCategoryStripeTone } from '@constants/categories';
import { cn } from '@module/utils/cn';
import {
  Calendar,
  CalendarPlus,
  Camera,
  Clock,
  Gift,
  Heart,
  Repeat2,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

/**
 * 챌린지 카드 — **앱(challenge_board_card.dart)과 1:1**.
 *
 * 앱이 카드를 재설계한 뒤 웹이 못 따라와 있었다. 아이덴티티 기준점이라
 * 수치까지 앱 소스를 정본으로 옮긴다. 캡처(1080×2400 @2.625, 논리 411×914)로
 * 구조·색을 확인했고, 숫자는 앱 상수에서 가져왔다.
 *
 *   카드      radius 12 · border 1px gray300 (보상 카드는 2px main800 + 글로우)
 *   썸네일    **풀블리드** aspect 4/3 (예전 웹의 px-3 pt-3 인셋은 앱이 걷어냈다)
 *   인원 뱃지 좌상단 top/left 8 — 상태 알약이 있던 자리를 물려받았다
 *   본문      padding 10/9/10/8 · 플래그줄 → 6 → 제목 → 6 → 메타(간격 4)
 *   글자      제목 15 extrabold · 메타 12
 *
 * 상태는 알약이 아니라 **본문 마지막 줄의 색**으로 말한다:
 *   시작 전 파랑 #1666BA · 진행 중 민트 #1D9C6D · 종료 회색 #767676
 */

export type ChallengeCardStatus = 'UPCOMING' | 'ONGOING' | 'ENDED';

export interface ChallengeCardHost {
  nickname: string;
  profileImg?: string | null;
  /** 레벨 젬 — 아직 웹에 레벨 기능이 없어 옵셔널이다(S3 에서 채운다). */
  level?: number | null;
}

export interface ChallengeCardProps {
  href: string;
  title: string;
  category?: string | null;
  categoryLabel?: string;
  imageUrl?: string | null;
  status?: ChallengeCardStatus;
  /** 본문 마지막 줄 문구 — "4일 뒤 (월) 시작" · "진행 중 · D-88" · "종료됨". */
  statusLabel?: string;
  /** 주기 알약 — "매일" · "주 5일". */
  cadenceLabel?: string;
  /** 기간 알약 — "23일 동안" · "제한 없음". */
  durationLabel?: string;
  /** 인원 뱃지 — "개인" · "12명" · "24/50명". */
  participantsLabel?: string;
  isGroup?: boolean;
  isPhotoRequired?: boolean;
  isOfficial?: boolean;
  hasReward?: boolean;
  /** 다음 회차 미리지원 가능(서버 ctaState === 'PRE_APPLY'). */
  canPreApply?: boolean;
  host?: ChallengeCardHost | null;
  /** 독서 챌린지 책 — 썸네일 안쪽 하단 바. moreCount 는 "외 N권" 의 N. */
  book?: {
    title: string;
    coverUrl?: string | null;
    moreCount?: number;
  } | null;
  liked?: boolean;
  onToggleLike?(): void;
}

const STATUS_COLOR: Record<ChallengeCardStatus, string> = {
  UPCOMING: 'text-[#1666BA]',
  ONGOING: 'text-[#1D9C6D]',
  ENDED: 'text-[#767676]',
};

/** 앱 AppFont: size3xs 12 · sizeSm 15 (내부 _up=2 반영값). */
const META_TEXT = 'text-[12px] leading-[1.4]';

function FlagChip({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: string;
}): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full',
        'px-2 py-[3px] text-[12px] font-bold'
      )}
      style={tone ? { backgroundColor: `${tone}1F`, color: tone } : undefined}
    >
      {icon}
      {label}
    </span>
  );
}

function MetaRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0 text-gray-500 [&_svg]:h-[14px] [&_svg]:w-[14px]">
        {icon}
      </span>
      {children}
    </div>
  );
}

function ChallengeCard({
  href,
  title,
  category,
  categoryLabel,
  imageUrl,
  status = 'ONGOING',
  statusLabel,
  cadenceLabel,
  durationLabel,
  participantsLabel,
  isGroup = false,
  isPhotoRequired = false,
  isOfficial = false,
  hasReward = false,
  canPreApply = false,
  host,
  book,
  liked = false,
  onToggleLike,
}: ChallengeCardProps): React.ReactElement {
  const tone = getCategoryStripeTone(category);
  const isEnded = status === 'ENDED';
  // 보상 카드 변형은 **공식 + 보상**일 때만이다(앱 highlighted 와 같은 조건).
  const highlighted = isOfficial && hasReward;

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-[12px] bg-white',
        highlighted ? 'border-2 border-[#ff5900]' : 'border border-[#E3E3E3]',
        isEnded && 'opacity-60'
      )}
      style={
        highlighted
          ? { boxShadow: '0 10px 30px -8px rgba(255,89,0,0.45)' }
          : undefined
      }
    >
      {/* 썸네일 — 풀블리드 4:3. 바깥 컨테이너가 모서리를 잘라 준다. */}
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ backgroundColor: tone }}
      >
        {imageUrl ? (
          <FadeInImage
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 280px, 50vw"
            className="object-cover"
          />
        ) : (
          <span
            className={cn('absolute inset-0 flex items-center justify-center')}
            aria-hidden
          >
            {isOfficial ? (
              <span
                className={cn(
                  'flex h-[52px] w-[52px] items-center justify-center',
                  'rounded-full bg-white shadow-md'
                )}
              >
                <Icon name="Logo" size={26} className="text-[#ff5900]" />
              </span>
            ) : (
              <span
                className={cn(
                  'flex h-[52px] w-[52px] items-center justify-center',
                  'rounded-full bg-white/20',
                  '[&_svg]:!h-6 [&_svg]:!w-6 [&_svg]:text-white'
                )}
              >
                <CategoryIcon category={category} />
              </span>
            )}
          </span>
        )}

        {/* 인원 뱃지 — 좌상단 고정(앱: Positioned top 8 left 8). */}
        {participantsLabel ? (
          <span
            className={cn(
              'absolute top-2 left-2 inline-flex items-center gap-1',
              'rounded-full bg-black/55 px-2 py-[3px]',
              'text-[12px] font-bold text-white'
            )}
          >
            {isGroup ? (
              <Users className="h-3.5 w-3.5" />
            ) : (
              <User className="h-3.5 w-3.5" />
            )}
            {participantsLabel}
          </span>
        ) : null}

        {/* 좋아요 — 우상단 흰 원. */}
        <button
          type="button"
          aria-label={liked ? '좋아요 취소' : '좋아요'}
          onClick={(event) => {
            event.preventDefault();
            onToggleLike?.();
          }}
          className={cn(
            'absolute top-2 right-2 z-[2] flex h-9 w-9 items-center',
            'justify-center rounded-full bg-white/90 transition',
            'hover:bg-white'
          )}
        >
          <Heart
            className={cn(
              'h-[18px] w-[18px]',
              liked ? 'fill-[#ff5900] text-[#ff5900]' : 'text-gray-500'
            )}
          />
        </button>

        {/* 독서 책 바 — 이미지 위라 카드 높이가 늘지 않는다. */}
        {book ? (
          <span
            className={cn(
              'absolute inset-x-0 bottom-0 flex items-center gap-2',
              'bg-gradient-to-t from-black/70 to-transparent px-2 pt-5 pb-1.5'
            )}
          >
            {book.coverUrl ? (
              // 표지는 외부 CDN(카카오) 썸네일이라 그대로 쓴다 — 변환하면
              // 원본이 없는 크기를 요구하게 된다.
              <img
                src={book.coverUrl}
                alt=""
                className="h-8 w-[22px] shrink-0 rounded-[2px] object-cover"
              />
            ) : null}
            <span className="truncate text-[12px] font-bold text-white">
              {book.title}
            </span>
            {book.moreCount && book.moreCount > 0 ? (
              <span className="shrink-0 text-[12px] font-bold text-white/80">
                외 {book.moreCount}
              </span>
            ) : null}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col px-[10px] pt-[9px] pb-2">
        {/* 플래그 줄 — 카테고리 + 인증샷(이 순서). 카테고리는 항상 있다. */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categoryLabel ? (
            <FlagChip
              tone={tone}
              icon={
                <span className="[&_svg]:!h-3.5 [&_svg]:!w-3.5">
                  <CategoryIcon category={category} />
                </span>
              }
              label={categoryLabel}
            />
          ) : null}
          {/* 미리지원은 지금 눌러야 하는 기회다 — 인증샷 같은 속성보다
              앞자리를 준다(앱과 같은 순서). */}
          {canPreApply ? (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full',
                'bg-[#FFEBE3] px-2 py-[3px]',
                'text-[12px] font-bold text-[#ff3c00]'
              )}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              미리지원 가능
            </span>
          ) : null}
          {isPhotoRequired ? (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full',
                'bg-gray-100 px-2 py-[3px] text-[12px] font-bold text-gray-600'
              )}
            >
              <Camera className="h-3.5 w-3.5" />
              인증샷
            </span>
          ) : null}
        </div>

        <h3
          className={cn(
            'mt-1.5 line-clamp-2 min-h-[2.6em] text-[15px] font-extrabold',
            'leading-snug tracking-[-0.2px] break-keep text-gray-900'
          )}
        >
          <Link href={href} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        <div className="mt-1.5 flex flex-col gap-1">
          {cadenceLabel ? (
            <MetaRow icon={<Repeat2 />}>
              <span
                className={cn(
                  'rounded-full bg-[#FFEBE3] px-2 py-[2px]',
                  'text-[#ff5900]',
                  META_TEXT,
                  'font-bold'
                )}
              >
                {cadenceLabel}
              </span>
            </MetaRow>
          ) : null}
          {durationLabel ? (
            <MetaRow icon={<Calendar />}>
              <span
                className={cn(
                  'rounded-full bg-gray-100 px-2 py-[2px] text-gray-600',
                  META_TEXT,
                  'font-bold'
                )}
              >
                {durationLabel}
              </span>
            </MetaRow>
          ) : null}
          {statusLabel ? (
            <MetaRow icon={<Clock />}>
              <span
                className={cn(META_TEXT, 'font-bold', STATUS_COLOR[status])}
              >
                {statusLabel}
              </span>
            </MetaRow>
          ) : null}
        </div>

        {/* 만든 주체 — 공식이면 태그, 아니면 프로필+닉네임(+레벨 젬). */}
        <div className="mt-1.5 flex min-h-[24px] flex-wrap items-center gap-1.5">
          {isOfficial ? (
            <>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full',
                  'bg-[#ff5900] px-2 py-[3px]',
                  'text-[12px] font-bold text-white'
                )}
              >
                <Icon name="Logo" size={13} />
                공식챌린지
              </span>
              {hasReward ? (
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-full',
                    'bg-[#FFEBE3] px-2 py-[3px]',
                    'text-[12px] font-bold text-[#ff3c00]'
                  )}
                >
                  <Gift className="h-3.5 w-3.5" />
                  보상
                </span>
              ) : null}
            </>
          ) : host ? (
            <>
              {/* 레벨 젬 자리 — 레벨 기능(S3) 이전엔 비운다. */}
              <CircleAvatar
                size="sm"
                imageUrl={host.profileImg ?? undefined}
                alt={host.nickname}
              />
              <span className="truncate text-[12px] font-bold text-[#767676]">
                {host.nickname}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ChallengeCard);
