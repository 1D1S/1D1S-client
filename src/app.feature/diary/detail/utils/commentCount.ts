import type { DiaryComment } from '../type/comment';

interface GetDiaryCommentTotalParams {
  /** 최상위 댓글 총 개수(pageInfo.totalElements) */
  totalElements: number;
  /** 최상위 댓글 목록 */
  items: DiaryComment[];
  /** commentId → 대댓글 목록 */
  repliesMap: Record<number, DiaryComment[] | undefined>;
}

/**
 * 총 댓글 수(최상위 + 대댓글). 상위 댓글의 replyCount 를 우선 쓰되, 없으면
 * repliesMap 의 실제 길이로 보정한다. DiaryCommentSection 과 DiaryDetailView
 * 에 중복돼 있던 계산을 단일 순수 함수로 통합한다.
 */
export function getDiaryCommentTotal({
  totalElements,
  items,
  repliesMap,
}: GetDiaryCommentTotalParams): number {
  const totalReplyCount = items.reduce(
    (accumulator, comment) =>
      accumulator +
      (comment.replyCount > 0
        ? comment.replyCount
        : (repliesMap[comment.id]?.length ?? 0)),
    0
  );

  return totalElements + totalReplyCount;
}
