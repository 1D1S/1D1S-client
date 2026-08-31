import { ChallengeParticipantListScreen } from '@feature/challenge/detail/screen/ChallengeParticipantListScreen';
import type { Metadata } from 'next';
import React from 'react';

interface ChallengeParticipantListPageProps {
  params: Promise<{ id: string }>;
}

// 참여자·일지 목록은 상세의 하위 뷰라 색인상 상세와 중복이다. canonical 을
// 부모 챌린지로 보내 "대체 페이지"로 흩어지지 않게 한다.
export async function generateMetadata({
  params,
}: ChallengeParticipantListPageProps): Promise<Metadata> {
  const { id } = await params;

  return { alternates: { canonical: `/challenge/${id}` } };
}

export default async function ChallengeParticipantListPage({
  params,
}: ChallengeParticipantListPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  return <ChallengeParticipantListScreen id={id} />;
}
