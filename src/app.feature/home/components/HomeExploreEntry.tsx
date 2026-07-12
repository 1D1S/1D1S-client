import { cn } from '@module/utils/cn';
import { Compass } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

// 홈(나의 오늘) → 탐색(/explore) 유도 진입점. 상단/바텀 네비의 탐색 탭과
// 별개로, 홈 본문에서도 카드로 탐색을 바로 열 수 있게 한다.
export default function HomeExploreEntry(): React.ReactElement {
  return (
    <Link
      href="/explore"
      className={cn(
        'rounded-4 flex w-full items-center gap-4 border px-5 py-4',
        'border-main-200 from-main-100 to-main-200 bg-gradient-to-br',
        'transition hover:brightness-105'
      )}
    >
      <span
        className={cn(
          'inline-flex h-11 w-11 shrink-0 items-center justify-center',
          'text-brand rounded-full bg-white'
        )}
      >
        <Compass className="h-5 w-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[15px] font-bold text-gray-900">
          새로운 챌린지 둘러보기
        </span>
        <span className="text-[13px] text-gray-600">
          오늘 시작해볼 챌린지와 다른 사람들의 기록을 만나보세요.
        </span>
      </span>
      <span aria-hidden className="text-brand text-lg font-bold">
        →
      </span>
    </Link>
  );
}
