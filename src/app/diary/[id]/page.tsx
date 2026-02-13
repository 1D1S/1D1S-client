import React from 'react';
interface DiaryDetailProps {
  params: Promise<{ id: string }>;
}

export default async function DiaryDetail({
  params,
}: DiaryDetailProps): Promise<React.ReactElement> {
  const { id } = await params;

  // TODO: 디자인 시스템 0.2.0 마이그레이션 완료 후 기존 페이지 복원
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-8 text-center text-gray-600">
      일지 상세 페이지(id: {id})는 디자인 시스템 0.2.0 마이그레이션 중이라 임시 비활성화되었습니다.
    </div>
  );
}
