import LikeBurst from '@component/LikeBurst';
import { cn } from '@module/utils/cn';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import React from 'react';

import type { DiaryDetailViewData } from '../utils/diaryViewData';

interface DiaryActionToolbarProps {
  diaryData: DiaryDetailViewData;
  totalCommentCount: number;
  isLikePending: boolean;
  // 앱에서 댓글 시트를 열 수 있을 때만 넘어온다. 없으면 카운터는 그대로
  // 표시 전용(span)이라 웹 동작이 바뀌지 않는다.
  onCommentTap?(): void;
  onLikeToggle(): void;
  onShare(): void;
}

// 일지 상세 액션 바(좋아요/댓글수/공유).
// DiaryDetailScreen 에서 분리한 컴포넌트(마크업/클래스 불변).
export function DiaryActionToolbar({
  diaryData,
  totalCommentCount,
  isLikePending,
  onCommentTap,
  onLikeToggle,
  onShare,
}: DiaryActionToolbarProps): React.ReactElement {
  const pillClass = cn(
    'inline-flex items-center gap-1.5 rounded-full border',
    'px-4 py-2 text-[13px] font-bold transition-colors'
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label="좋아요"
        onClick={onLikeToggle}
        disabled={isLikePending}
        className={cn(
          pillClass,
          'relative disabled:opacity-60',
          diaryData.likedByMe
            ? 'border-main-800 bg-main-100 text-main-800'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        )}
      >
        <LikeBurst liked={diaryData.likedByMe} />
        <Heart
          className={cn('h-3.5 w-3.5', diaryData.likedByMe && 'fill-current')}
        />
        {diaryData.likeCount}
      </button>
      {onCommentTap ? (
        <button
          type="button"
          aria-label={`댓글 ${totalCommentCount}개 보기`}
          onClick={onCommentTap}
          className={cn(
            pillClass,
            'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {totalCommentCount}
        </button>
      ) : (
        <span
          aria-label={`댓글 ${totalCommentCount}개`}
          className={cn(pillClass, 'border-gray-200 bg-white text-gray-700')}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {totalCommentCount}
        </span>
      )}
      <button
        type="button"
        aria-label="공유"
        onClick={onShare}
        className={cn(
          pillClass,
          'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        )}
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
