'use client';

import { challengeDetailApi } from '@feature/challenge/detail/api/challengeDetailApi';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// 참여자 전원을 한 번에 받는다. 생성 폼이 인원을 100명으로 막고 있어
// 한 페이지로 충분하다.
// ponytail: 상한이 풀리면 무한스크롤로 승격.
const FETCH_SIZE = 100;

/**
 * 방 참여자의 프로필 이미지를 memberId 로 찾는 표.
 *
 * **채팅 메시지 계약(ChatMessageResponse)에는 프로필 이미지가 없다.** 그래서
 * 방이 걸린 챌린지의 참여자 목록에서 가져온다 — 채팅 전용 참여자 API 가
 * 따로 없어 챌린지 참여자 화면과 같은 것을 쓴다(헤더의 참여자 보기와 동일).
 *
 * 실패해도 조용히 빈 표를 준다. 아바타는 닉네임 이니셜로 떨어지면 그만이라,
 * 이것 때문에 대화가 안 보이면 안 된다.
 */
export function useChatSenderAvatars(
  challengeId?: number
): Map<number, string> {
  const { data } = useQuery({
    queryKey: ['chat', 'sender-avatars', challengeId],
    queryFn: () =>
      challengeDetailApi.getParticipants(challengeId as number, {
        size: FETCH_SIZE,
      }),
    enabled: Boolean(challengeId),
    // 대화 도중 프로필이 바뀌는 일은 드물다. 방을 열 때마다 다시 받지
    // 않게 오래 들고 있는다.
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    const map = new Map<number, string>();
    (data?.items ?? []).forEach((participant) => {
      const url = participant.profileImg?.trim();
      if (url) {
        map.set(participant.memberId, url);
      }
    });
    return map;
  }, [data]);
}
