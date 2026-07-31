import { DiaryCommentsScreen } from '@/app.feature/diary/detail/screen/DiaryCommentsScreen';

// 댓글 전용 페이지. 앱이 이 경로를 네이티브 바텀시트로 띄운다
// (comment_sheet_open). 본문·헤더 없이 목록만 있는 얇은 화면이라,
// 시트 높이 안에서 목록과 네이티브 입력 바가 같은 레이어에 놓인다.
export default async function DiaryCommentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;
  return <DiaryCommentsScreen diaryId={Number(id)} />;
}
