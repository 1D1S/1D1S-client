'use client';

import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { cn } from '@module/utils/cn';
import React from 'react';

import { VoteContent } from '../components/VoteContent';

/**
 * 네이티브 바텀시트가 웹뷰로 로드하는 투표 단독 화면(`/vote?sheet=1`).
 *
 * 딤·슬라이드업·바깥탭·닫기는 전부 네이티브 시트가 담당하므로 웹은
 * 콘텐츠만 그린다 — 카드 테두리·라운드·그림자·fixed 포지셔닝·X 버튼 없음.
 * 목록/상세/투표/재투표 4상태는 플로팅 위젯과 같은 VoteContent 를 쓴다.
 *
 * 투표를 마쳐도 이동하지 않는다. 결과가 그대로 남아 시트 안에 머문다.
 */
export function VoteSheetScreen(): React.ReactElement {
  // 부팅 세션 확인 전(unknown)에는 게스트로 단정하지 않는다 — 앱 콜드 스타트
  // 에서 로그인 사용자에게 로그인 안내가 번쩍이던 문제(useAuthStatus 도입 사유).
  const status = useAuthStatus();

  return (
    <div className={cn('min-h-dvh w-full bg-white', 'px-5 py-4')}>
      {status === 'guest' ? (
        <p className="py-6 text-center text-sm text-gray-500">
          로그인 후 참여할 수 있어요.
        </p>
      ) : (
        <VoteContent enabled={status === 'authenticated'} bare />
      )}
    </div>
  );
}
