'use client';

import { MemberDiaryListScreen } from '@feature/diary/board/screen/MemberDiaryListScreen';
import { useParams } from 'next/navigation';

export default function MemberDiaryListPage(): React.ReactElement {
  const { memberId } = useParams<{ memberId: string }>();

  return <MemberDiaryListScreen memberId={memberId} />;
}
