import { cn } from '@module/utils/cn';
import { ChevronRight, Newspaper } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

/**
 * 탐색 화면의 가이드 진입점 한 칸.
 *
 * 주제별 가이드(습관·스트릭·독서·루틴)가 마이페이지 > 설정 안에만 걸려
 * 있어 일반 동선으로는 닿지 않았다. 네비 탭을 늘리는 대신 "둘러보기"
 * 성격의 탐색 화면에 링크 한 줄만 둔다.
 *
 * HomeNoticeStrip 과 같은 스트립 형태라 탐색 상단 카드들과 나란히 놓인다.
 * 데이터를 읽지 않는 정적 마크업이라 SSR 결과에 링크가 그대로 실린다.
 */
export function ExploreGuideStrip(): React.ReactElement {
  return (
    <Link
      href="/guide"
      className={cn(
        'flex w-full cursor-pointer items-center gap-3',
        'rounded-4 border border-gray-200 bg-white px-4 py-3',
        'text-gray-800 transition',
        'hover:border-gray-300 hover:bg-gray-50'
      )}
    >
      <span
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center',
          'bg-main-200 text-main-800 rounded-full'
        )}
      >
        <Newspaper className="h-3.5 w-3.5" />
      </span>
      <span
        className={cn(
          'bg-main-200 text-main-800 shrink-0 rounded-full',
          'px-2 py-0.5 text-[11px] font-bold'
        )}
      >
        가이드
      </span>
      <span className="flex-1 truncate text-sm font-medium">
        습관·스트릭·독서 챌린지, 어떻게 시작할까요?
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
    </Link>
  );
}
