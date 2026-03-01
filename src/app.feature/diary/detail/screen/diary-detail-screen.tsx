'use client';

import { Button, CheckList, Tag, Text } from '@1d1s/design-system';
import {
  CalendarDays,
  ChevronRight,
  Edit3,
  Heart,
  ListChecks,
  NotebookPen,
  Share2,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDiaryDetail } from '../../board/hooks/use-diary-queries';
import {
  useCreateDiaryReport,
  useDeleteDiary,
  useLikeDiary,
  useUnlikeDiary,
} from '../hooks/use-diary-mutations';

interface ChecklistOption {
  id: string;
  label: string;
}

function AchievementChecklist({
  leftOptions,
  rightOptions,
  initialCheckedIds,
}: {
  leftOptions: ChecklistOption[];
  rightOptions: ChecklistOption[];
  initialCheckedIds: string[];
}): React.ReactElement {
  const [checkedIds, setCheckedIds] = useState<string[]>(initialCheckedIds);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <CheckList
        options={leftOptions}
        value={checkedIds}
        onValueChange={setCheckedIds}
      />
      <CheckList
        options={rightOptions}
        value={checkedIds}
        onValueChange={setCheckedIds}
      />
    </div>
  );
}

export function DiaryDetailScreen({
  diaryId,
}: {
  diaryId: number;
}): React.ReactElement {
  const router = useRouter();
  const { data: diaryData, isLoading, isError, error } =
    useDiaryDetail(diaryId);
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();
  const deleteDiary = useDeleteDiary();
  const createDiaryReport = useCreateDiaryReport();

  const feelingEmoji = useMemo(() => {
    if (!diaryData) {
      return '🙂';
    }

    if (diaryData.diaryInfo.feeling === 'HAPPY') {
      return '😄';
    }
    if (diaryData.diaryInfo.feeling === 'SAD') {
      return '😢';
    }
    return '🙂';
  }, [diaryData]);

  const formattedDate = useMemo(() => {
    if (!diaryData) {
      return '';
    }

    const date = new Date(diaryData.diaryInfo.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateLabel = `${year}.${month}.${day}`;

    const weekdayLabel = new Intl.DateTimeFormat('ko-KR', {
      weekday: 'long',
    }).format(date);

    return `${dateLabel} | ${weekdayLabel}`;
  }, [diaryData]);

  const checklistItems = useMemo(() => {
    if (!diaryData?.diaryInfo.achievement?.length) {
      return [];
    }

    return diaryData.diaryInfo.achievement.map((goalId) => ({
      id: String(goalId),
      label: `달성 목표 #${goalId}`,
    }));
  }, [diaryData]);

  const leftChecklistOptions = useMemo(
    () =>
      checklistItems
        .filter((_, index) => index % 2 === 0)
        .map((item) => ({ id: item.id, label: item.label })),
    [checklistItems]
  );
  const rightChecklistOptions = useMemo(
    () =>
      checklistItems
        .filter((_, index) => index % 2 === 1)
        .map((item) => ({ id: item.id, label: item.label })),
    [checklistItems]
  );
  const initialCheckedIds = useMemo(
    () => checklistItems.map((item) => item.id),
    [checklistItems]
  );

  const imageUrl = useMemo(() => {
    if (!diaryData) {
      return '/images/default-card.png';
    }

    const candidate = diaryData.img?.[0]?.url ?? diaryData.imgUrl;
    if (!candidate) {
      return '/images/default-card.png';
    }

    if (candidate.startsWith('/')) {
      return candidate;
    }

    const allowedDomains = ['placehold.co', 'localhost', 'picsum.photos'];
    const isAllowedDomain = allowedDomains.some((domain) =>
      candidate.includes(domain)
    );
    return isAllowedDomain ? candidate : '/images/default-card.png';
  }, [diaryData]);

  const contentParagraphs = useMemo(() => {
    if (!diaryData?.content) {
      return ['작성된 내용이 없습니다.'];
    }

    return diaryData.content
      .split('\n')
      .map((text) => text.trim())
      .filter(Boolean);
  }, [diaryData]);
  const challengeMetaTags = useMemo(
    () => [
      diaryData?.challenge.category,
      diaryData?.challenge.challengeType,
      `${diaryData?.diaryInfo.achievementRate ?? 0}%`,
      `${diaryData?.challenge.startDate ?? ''}~${diaryData?.challenge.endDate ?? ''}`,
    ].filter(Boolean) as string[],
    [diaryData]
  );

  const handleShare = async (): Promise<void> => {
    if (!diaryData) {
      return;
    }

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

  const handleToggleLike = (): void => {
    if (!diaryData) {
      return;
    }

    if (diaryData.likeInfo.likedByMe) {
      unlikeDiary.mutate(diaryId, {
        onSuccess: () => toast.success('좋아요를 취소했습니다.'),
        onError: () => toast.error('좋아요 취소에 실패했습니다.'),
      });
      return;
    }

    likeDiary.mutate(diaryId, {
      onSuccess: () => toast.success('좋아요를 눌렀습니다.'),
      onError: () => toast.error('좋아요 요청에 실패했습니다.'),
    });
  };

  const handleDelete = (): void => {
    if (!window.confirm('이 일지를 삭제하시겠습니까?')) {
      return;
    }

    deleteDiary.mutate(diaryId, {
      onSuccess: () => {
        toast.success('일지를 삭제했습니다.');
        router.push('/diary');
      },
      onError: () => {
        toast.error('일지 삭제에 실패했습니다.');
      },
    });
  };

  const handleReport = (): void => {
    const content = window.prompt('신고 사유를 입력해 주세요.');
    if (!content || !content.trim()) {
      return;
    }

    createDiaryReport.mutate(
      {
        diaryId,
        content: content.trim(),
        reportType: 'ETC',
      },
      {
        onSuccess: () => toast.success('신고가 접수되었습니다.'),
        onError: () => toast.error('신고 접수에 실패했습니다.'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <Text size="body1" weight="medium" className="text-gray-500">
          일지 상세 정보를 불러오는 중입니다...
        </Text>
      </div>
    );
  }

  if (isError || !diaryData) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white px-4">
        <Text size="body1" weight="medium" className="text-red-600">
          {error?.message ?? '일지 상세 정보를 불러오지 못했습니다.'}
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-[1240px] px-4 pt-10 pb-16 md:px-6 lg:px-8">
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
              <span className="bg-main-200 flex h-7 w-7 items-center justify-center rounded-full">
                {feelingEmoji}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <Text size="body2" weight="medium" className="text-gray-500">
                {formattedDate}
              </Text>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:gap-3">
            <Button
              variant="outlined"
              size="medium"
              onClick={() => void handleShare()}
              className="min-w-[88px]"
            >
              <Share2 className="mr-1 h-4 w-4" />
              공유
            </Button>
            <Button
              variant="default"
              size="medium"
              onClick={() => router.push(`/diary/create?diaryId=${diaryId}`)}
              className="min-w-[100px]"
            >
              <Edit3 className="mr-1 h-4 w-4" />
              일지 수정
            </Button>
            <Button
              variant={diaryData.likeInfo.likedByMe ? 'default' : 'outlined'}
              size="medium"
              onClick={handleToggleLike}
              disabled={likeDiary.isPending || unlikeDiary.isPending}
              className="min-w-[110px]"
            >
              <Heart className="mr-1 h-4 w-4" />
              좋아요 {diaryData.likeInfo.likeCnt}
            </Button>
            <Button
              variant="outlined"
              size="medium"
              onClick={handleDelete}
              disabled={deleteDiary.isPending}
              className="min-w-[88px]"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              삭제
            </Button>
            <Button
              variant="outlined"
              size="medium"
              onClick={handleReport}
              disabled={createDiaryReport.isPending}
              className="min-w-[88px]"
            >
              신고
            </Button>
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-gray-200" />

        <section className="rounded-3 mt-8 border border-gray-200 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-main-200 text-main-800 flex h-10 w-10 items-center justify-center rounded-xl">
                <NotebookPen className="h-5 w-5" />
              </div>
              <div>
                <Text size="caption2" weight="bold" className="text-gray-500">
                  CONNECTED CHALLENGE
                </Text>
                <Text size="heading2" weight="bold" className="text-gray-900">
                  {diaryData.challenge.title}
                </Text>
              </div>
            </div>

            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push(`/challenge/${diaryData.challenge.challengeId}`)}
            >
              챌린지 보기
            </Button>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="text-main-800 h-5 w-5" />
            <Text size="heading1" weight="bold" className="text-gray-900">
              Today&apos;s Achievement
            </Text>
          </div>

          {checklistItems.length > 0 ? (
            <AchievementChecklist
              key={diaryId}
              leftOptions={leftChecklistOptions}
              rightOptions={rightChecklistOptions}
              initialCheckedIds={initialCheckedIds}
            />
          ) : (
            <div className="rounded-3 border border-gray-200 bg-white p-5">
              <Text size="body2" weight="regular" className="text-gray-600">
                체크리스트 데이터가 없습니다. 달성률 {diaryData.diaryInfo.achievementRate}%.
              </Text>
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-3 flex items-center gap-2">
            <NotebookPen className="text-main-800 h-5 w-5" />
            <Text size="heading1" weight="bold" className="text-gray-900">
              Log Content
            </Text>
          </div>

          <div className="rounded-3 border border-gray-200 bg-white p-6">
            <div className="space-y-2">
              {contentParagraphs.map((paragraph, index) => (
                <Text
                  key={index}
                  size="body2"
                  weight="regular"
                  className="text-gray-700"
                >
                  {paragraph}
                </Text>
              ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl">
              <Image
                src={imageUrl}
                alt={`${diaryData.title} 이미지`}
                width={1000}
                height={800}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {challengeMetaTags.map((tag) => (
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
