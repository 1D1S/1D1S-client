'use client';

import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import React, { useMemo } from 'react';

import { DiaryCommentSection } from '../components/DiaryCommentSection';
import { resolveSidebarMemberId } from '../utils/diaryViewData';

// 댓글 전용 화면. 앱이 네이티브 바텀시트로 띄운다(comment_sheet_open).
//
// 본문·헤더 없이 목록만 그린다 — 시트 높이 안에서 목록과 네이티브 입력 바가
// 같은 레이어에 놓여, 키보드가 올라와도 목록이 그대로 보인다. 입력은 앱의
// 네이티브 바가 맡으므로 여기서는 웹 입력창을 두지 않는다(DiaryCommentSection
// 이 comment_input 피처를 보고 알아서 감춘다).
interface DiaryCommentsScreenProps {
  diaryId: number;
}

export function DiaryCommentsScreen({
  diaryId,
}: DiaryCommentsScreenProps): React.ReactElement {
  const isLoggedIn = useIsLoggedIn();
  const { data: sidebarData } = useSidebar();
  const currentMemberId = useMemo(
    () => resolveSidebarMemberId(sidebarData),
    [sidebarData]
  );
  const currentUserNickname = useMemo(
    () => sidebarData?.nickname?.trim() ?? null,
    [sidebarData?.nickname]
  );

  return (
    <div className="px-4 pt-2 pb-4">
      <DiaryCommentSection
        diaryId={diaryId}
        currentMemberId={currentMemberId}
        currentUserNickname={currentUserNickname}
        isLoggedIn={isLoggedIn}
        onRequireLogin={() => {}}
      />
    </div>
  );
}
