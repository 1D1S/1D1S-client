'use client';

import React, { useState } from 'react';
import {
  PageTitle,
  Spacing,
  PageWatermark,
  ChallengeListItem,
  TextField,
  Pagination,
} from '@1d1s/design-system';

export default function ChallengeList(): React.ReactElement {
  const [page, setPage] = useState(1);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* 메인 콘텐츠 */}
      <div className="flex w-full flex-col px-4 pt-16">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="챌린지 목록" />
        </div>
        <Spacing className="h-8" />

        <div className="flex w-full justify-end">
          <div className="w-[320px]">
            <TextField
              variant="search"
              className="w-full"
              placeholder="검색어를 입력해주세요."
            />
          </div>
        </div>

        <div className="flex w-full flex-col">
          {Array.from({ length: 10 }).map((_, idx) => (
            <ChallengeListItem
              key={idx}
              className="mt-4"
              challengeName={`고라니 밥주기 챌린지 ${idx + 1}`}
              startDate={'2025.04.05'}
              endDate={'2025.04.10'}
              maxParticipants={20}
              currentParticipants={idx + 1}
            />
          ))}
        </div>

        <Spacing className="h-8" />
        <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />

        <Spacing className="h-12" />
        <div className="flex w-full justify-center">
          <PageWatermark />
        </div>
        <Spacing className="h-8" />
      </div>
    </div>
  );
}
