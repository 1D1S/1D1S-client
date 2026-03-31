'use client';

import { MemberDiaryListScreen } from '@feature/diary/board/screen/member-diary-list-screen';
import { useParams } from 'next/navigation';

export default function MemberDiaryListPage(): React.ReactElement {
  const { memberId } = useParams<{ memberId: string }>();

  return <MemberDiaryListScreen memberId={memberId} />;
}
