'use client';

import type { CommentNode } from '@1d1s/design-system';
import { useCallback, useMemo } from 'react';

import { DiaryComment } from '../type/comment';
import { getDiaryCommentTotal } from '../utils/commentCount';
import {
  formatCommentDateTime,
  sortCommentsByOldest,
} from '../utils/diaryViewData';
import {
  useCommentRepliesMap,
  useDiaryComments,
} from './useDiaryCommentQueries';

export const COMMENT_LIST_PARAMS = { page: 0, size: 10 } as const;
export const REPLIES_MAP_PARAMS = { page: 0, size: 10 } as const;

export interface UseCommentTreeResult {
  threadComments: CommentNode[];
  /** DFS 순서로 평탄화한 작성자 id (아바타 클릭 위임용) */
  flatCommentAuthors: Array<{ id: string }>;
  /** <li> 문서 순서와 일치하는 원본 comment 메타 (삭제 행 클릭 차단용) */
  flatCommentMeta: Array<{ id: number; isDeleted: boolean }>;
  deletedCommentIds: Set<number>;
  /** 대댓글 id → 루트(원본) 댓글 id */
  replyTargetRootIdMap: Map<number, number>;
  totalCommentCount: number;
  isCommentsLoading: boolean;
  isCommentsError: boolean;
}

/**
 * 일지 댓글 트리 구성 훅 — 댓글/대댓글 조회 결과를 DS CommentThread 가
 * 받는 CommentNode[] 로 변환하고, 위임/차단/카운트용 파생 구조를 함께
 * 만든다. DiaryCommentSection 에서 분리했으며 동작은 동일하다.
 */
export function useCommentTree(
  diaryId: number,
  currentMemberId: number | null,
  currentUserNickname: string | null
): UseCommentTreeResult {
  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useDiaryComments(diaryId, COMMENT_LIST_PARAMS);
  const commentItems = useMemo(
    () => sortCommentsByOldest(commentsData?.items ?? []),
    [commentsData?.items]
  );
  const commentIds = useMemo(
    () => commentItems.map((comment) => comment.id),
    [commentItems]
  );
  const repliesMapParams = useMemo(
    () => ({ ...REPLIES_MAP_PARAMS, enabled: commentIds.length > 0 }),
    [commentIds.length]
  );
  const { data: commentRepliesMap = {} } = useCommentRepliesMap(
    commentIds,
    repliesMapParams
  );

  const mapCommentNode = useCallback(
    (comment: DiaryComment): CommentNode => {
      const authorNickname = comment.author.nickname?.trim();

      return {
        id: String(comment.id),
        content: comment.content || '삭제된 댓글입니다.',
        createdAt: formatCommentDateTime(comment.createdAt),
        author: {
          id: String(comment.author.id),
          nickname: comment.author.nickname || '익명',
          profileImageUrl: comment.author.profileImage ?? undefined,
        },
        isAuthor:
          (currentMemberId !== null && comment.author.id === currentMemberId) ||
          (currentMemberId === null &&
            Boolean(authorNickname) &&
            Boolean(currentUserNickname) &&
            authorNickname === currentUserNickname),
      };
    },
    [currentUserNickname, currentMemberId]
  );

  const sortedRepliesMap = useMemo<Map<number, DiaryComment[]>>(() => {
    const map = new Map<number, DiaryComment[]>();
    for (const comment of commentItems) {
      map.set(
        comment.id,
        sortCommentsByOldest(commentRepliesMap[comment.id] ?? [])
      );
    }
    return map;
  }, [commentItems, commentRepliesMap]);

  const threadComments = useMemo<CommentNode[]>(
    () =>
      commentItems.map((comment) => ({
        ...mapCommentNode(comment),
        replies: (sortedRepliesMap.get(comment.id) ?? []).map(mapCommentNode),
      })),
    [commentItems, sortedRepliesMap, mapCommentNode]
  );

  // DS CommentThread는 onAvatarClick 같은 prop을 노출하지 않아 이벤트 위임으로
  // 처리. CommentThread 내부 아바타에 붙어 있는 `data-slot="circle-avatar"`
  // 속성을 후크로 사용하고, 클릭된 아바타의 인덱스(DFS 순서) → flatCommentAuthors
  // 매핑으로 멤버 ID 를 결정한다. DS 의 data-slot 또는 렌더 순서가 바뀌면 함께
  // 업데이트해야 한다.
  const flatCommentAuthors = useMemo<Array<{ id: string }>>(() => {
    const out: Array<{ id: string }> = [];
    const walk = (nodes: CommentNode[]): void => {
      for (const node of nodes) {
        out.push({ id: node.author.id });
        if (node.replies && node.replies.length > 0) {
          walk(node.replies);
        }
      }
    };
    walk(threadComments);
    return out;
  }, [threadComments]);

  // threadComments 와 동일한 DFS 순서로 원본 comment 메타(id, isDeleted)를
  // 평탄화. DS 가 comment 당 <li> 하나를 렌더하므로 querySelectorAll('li') 의
  // 문서 순서와 일치한다.
  const flatCommentMeta = useMemo<
    Array<{ id: number; isDeleted: boolean }>
  >(() => {
    const out: Array<{ id: number; isDeleted: boolean }> = [];
    for (const comment of commentItems) {
      out.push({ id: comment.id, isDeleted: comment.isDeleted });
      const replies = sortedRepliesMap.get(comment.id) ?? [];
      for (const reply of replies) {
        out.push({ id: reply.id, isDeleted: reply.isDeleted });
      }
    }
    return out;
  }, [commentItems, sortedRepliesMap]);

  const deletedCommentIds = useMemo<Set<number>>(() => {
    const ids = new Set<number>();
    for (const meta of flatCommentMeta) {
      if (meta.isDeleted) {
        ids.add(meta.id);
      }
    }
    return ids;
  }, [flatCommentMeta]);

  // 대댓글의 대댓글은 허용하지 않으므로, 답글 대상 id 를 항상 원본(루트)
  // 댓글 id 로 정규화한다. 리프 노드(대댓글) 클릭 시에도 부모(원본) 댓글에
  // 답글이 달리도록 한다.
  const replyTargetRootIdMap = useMemo<Map<number, number>>(() => {
    const map = new Map<number, number>();
    for (const comment of commentItems) {
      map.set(comment.id, comment.id);
      const replies = commentRepliesMap[comment.id] ?? [];
      for (const reply of replies) {
        map.set(reply.id, comment.id);
      }
    }
    return map;
  }, [commentItems, commentRepliesMap]);

  const totalCommentCount = useMemo(
    () =>
      getDiaryCommentTotal({
        totalElements: commentsData?.pageInfo.totalElements ?? 0,
        items: commentItems,
        repliesMap: commentRepliesMap,
      }),
    [commentItems, commentRepliesMap, commentsData?.pageInfo.totalElements]
  );

  return {
    threadComments,
    flatCommentAuthors,
    flatCommentMeta,
    deletedCommentIds,
    replyTargetRootIdMap,
    totalCommentCount,
    isCommentsLoading,
    isCommentsError,
  };
}
