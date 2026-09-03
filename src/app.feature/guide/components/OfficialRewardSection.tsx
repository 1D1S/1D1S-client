import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Check, Gift, Info, Trophy } from 'lucide-react';
import React from 'react';

const REWARD_POINTS = [
  '상위 5명에게 지급',
  '참여자 수에 따라 5명보다 더 많이 지급될 수 있어요',
  '챌린지 종료 후 최종 순위를 기준으로 지급',
  '지급 방식·일정은 챌린지 상세 공지를 확인하세요',
];

// 네이버 포인트 브랜드 컬러 — DS 토큰에 없는 외부 브랜드 색
// ponytail: 인라인 상수 1개, 브랜드 색이라 토큰화 불필요
const NAVER_GREEN = '#03C75A';

// 공식 챌린지 가이드 "보상 안내" 섹션.
// OfficialGuideScreen 에서 분리한 프레젠테이션 컴포넌트(마크업/클래스 불변).
export function OfficialRewardSection(): React.ReactElement {
  return (
    <section className="pt-16">
      <div className="animate-pop-in mb-9 text-center">
        <Text
          size="caption1"
          weight="extrabold"
          className="text-main-800 mb-2 block tracking-wide"
        >
          REWARD
        </Text>
        <Text
          as="h2"
          size="display1"
          weight="extrabold"
          className="block tracking-tight text-gray-900"
        >
          보상 안내
        </Text>
      </div>
      <div
        className={cn(
          'animate-pop-in rounded-4 flex flex-col items-center gap-7 border',
          'border-gray-200 bg-white p-7 sm:p-9',
          'shadow-[0_2px_10px_rgba(0,0,0,0.04)]',
          'lg:flex-row lg:items-center'
        )}
      >
        {/* 기프티콘 카드 목업 */}
        <div
          className={cn(
            'w-[240px] shrink-0 overflow-hidden rounded-[18px] border',
            'border-gray-200 bg-white shadow-[0_8px_22px_rgba(0,0,0,0.08)]'
          )}
        >
          <div
            className="px-5 pt-5 pb-4 text-white"
            style={{ backgroundColor: NAVER_GREEN }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[12px] font-bold opacity-90">GIFT</span>
              <Gift className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="text-[13px] font-medium opacity-90">
              네이버 포인트
            </div>
            <div className="mt-0.5 text-[30px] font-extrabold tracking-tight">
              10,000
              <span className="ml-1 text-[15px] font-bold">원</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-3.5">
            <span
              className={cn(
                'flex h-[30px] w-[30px] items-center justify-center',
                'rounded-[8px] bg-gray-100'
              )}
            >
              <Trophy
                className="h-[15px] w-[15px]"
                strokeWidth={2}
                style={{ color: NAVER_GREEN }}
              />
            </span>
            <div>
              <div className="text-[11px] font-medium text-gray-400">
                공식 챌린지 보상
              </div>
              <div className="text-[12.5px] font-bold text-gray-800">
                기프티콘
              </div>
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 lg:flex-1">
          <span
            className={cn(
              'mb-3.5 inline-block rounded-full px-3 py-1',
              'text-[12px] font-bold text-white'
            )}
            style={{ backgroundColor: NAVER_GREEN }}
          >
            1만원 상당
          </span>
          <Text
            as="h3"
            size="heading1"
            weight="extrabold"
            className="mb-3 block tracking-tight break-keep text-gray-900"
          >
            네이버 포인트 기프티콘
          </Text>
          <Text
            size="body1"
            weight="regular"
            className="mb-4.5 block leading-relaxed break-keep text-gray-600"
          >
            공식 챌린지 순위에 따라 1만원 상당의 네이버 포인트 기프티콘이
            지급됩니다.
          </Text>
          <ul className="flex flex-col gap-2.5">
            {REWARD_POINTS.map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0"
                  strokeWidth={2.6}
                  style={{ color: NAVER_GREEN }}
                />
                <Text
                  size="body2"
                  weight="regular"
                  className="block break-keep text-gray-700"
                >
                  {t}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 지급 유의사항 — 순위 안에 들어도 완주하지 않으면 미지급 */}
      <div
        className={cn(
          'animate-pop-in rounded-4 mx-auto mt-5 flex max-w-[640px] gap-3.5',
          'border border-red-200 bg-red-50 p-5 sm:p-6'
        )}
      >
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center',
            'rounded-[11px] border border-red-300 bg-white'
          )}
        >
          <Info className="h-5 w-5 text-red-500" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <Text
            size="body1"
            weight="extrabold"
            className="mb-2 block break-keep text-gray-900"
          >
            지급 전 꼭 확인하세요
          </Text>
          <ul className="flex flex-col gap-2">
            <li className="flex items-start gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-red-400" />
              <Text
                size="body2"
                weight="regular"
                className="block leading-relaxed break-keep text-gray-700"
              >
                순위가 <b>5위 안에 들더라도, 완주자가 아니면</b> 상품은 지급되지
                않아요.
              </Text>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-red-400" />
              <Text
                size="body2"
                weight="regular"
                className="block leading-relaxed break-keep text-gray-700"
              >
                완주 기준은 <b>챌린지 목표의 70% 이상 수행</b>이에요.
              </Text>
            </li>
          </ul>
        </div>
      </div>

      <Text
        size="caption2"
        weight="regular"
        className="animate-pop-in mx-auto mt-4.5 block max-w-[640px] text-center leading-relaxed break-keep text-gray-400"
      >
        보상 종류·금액·수량 및 지급 조건은 챌린지별 공지에 따라 달라질 수
        있으며, 부정 참여가 확인되면 지급이 제한될 수 있습니다.
      </Text>
    </section>
  );
}
