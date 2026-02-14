'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, CheckList, Tag, Text } from '@1d1s/design-system';
import {
  CalendarDays,
  ChevronRight,
  Edit3,
  ListChecks,
  NotebookPen,
  Share2,
} from 'lucide-react';
import type { DiaryDetailData } from '../consts/diary-detail-data';

export function DiaryDetailClient({
  diaryData,
}: {
  diaryData: DiaryDetailData;
}): React.ReactElement {
  const router = useRouter();
  const [checkedIds, setCheckedIds] = useState<string[]>(diaryData.checkedChecklistIds);

  const leftChecklistOptions = useMemo(
    () =>
      diaryData.checklistItems
        .filter((_, index) => index % 2 === 0)
        .map((item) => ({ id: item.id, label: item.label })),
    [diaryData.checklistItems]
  );
  const rightChecklistOptions = useMemo(
    () =>
      diaryData.checklistItems
        .filter((_, index) => index % 2 === 1)
        .map((item) => ({ id: item.id, label: item.label })),
    [diaryData.checklistItems]
  );

  const handleShare = async (): Promise<void> => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: diaryData.title,
        text: `${diaryData.title} 일지를 공유합니다.`,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-[1080px] px-4 pb-12 pt-8">
        <div className="flex items-center gap-1 text-gray-500">
          <Text size="caption2" weight="medium" className="text-gray-500">
            Logs
          </Text>
          <ChevronRight className="h-3 w-3" />
          <Text size="caption2" weight="medium" className="text-gray-500">
            Daily Log Detail
          </Text>
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Text size="display1" weight="bold" className="text-gray-900">
                {diaryData.title}
              </Text>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-main-200">
                🙂
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <Text size="body2" weight="medium" className="text-gray-500">
                {diaryData.dateLabel} | {diaryData.weekdayLabel}
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outlined" size="medium" onClick={() => void handleShare()}>
              <Share2 className="mr-1 h-4 w-4" />
              공유
            </Button>
            <Button variant="default" size="medium" onClick={() => router.push('/diary/create')}>
              <Edit3 className="mr-1 h-4 w-4" />
              일지 수정
            </Button>
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-gray-200" />

        <section className="mt-6 rounded-3 border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-main-200 text-main-800">
                <NotebookPen className="h-5 w-5" />
              </div>
              <div>
                <Text size="caption2" weight="bold" className="text-gray-500">
                  CONNECTED CHALLENGE
                </Text>
                <Text size="heading2" weight="bold" className="text-gray-900">
                  {diaryData.connectedChallengeTitle}
                </Text>
              </div>
            </div>

            <Button variant="outlined" size="small" onClick={() => router.push('/challenge')}>
              챌린지 보기
            </Button>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-main-800" />
            <Text size="heading1" weight="bold" className="text-gray-900">
              Today&apos;s Checklist
            </Text>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <CheckList
              options={leftChecklistOptions}
              value={checkedIds}
              onValueChange={setCheckedIds}
            />
            <CheckList
              options={rightChecklistOptions}
              value={checkedIds}
              onValueChange={setCheckedIds}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <NotebookPen className="h-5 w-5 text-main-800" />
            <Text size="heading1" weight="bold" className="text-gray-900">
              Log Content
            </Text>
          </div>

          <div className="rounded-3 border border-gray-200 bg-white p-5">
            <div className="space-y-2">
              {diaryData.contentParagraphs.map((paragraph, index) => (
                <Text key={index} size="body2" weight="regular" className="text-gray-700">
                  {paragraph}
                </Text>
              ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl">
              <Image
                src={diaryData.imageUrl}
                alt={`${diaryData.title} 이미지`}
                width={1000}
                height={800}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {diaryData.tags.map((tag) => (
                <Tag key={tag} size="caption3" weight="medium">
                  #{tag}
                </Tag>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
