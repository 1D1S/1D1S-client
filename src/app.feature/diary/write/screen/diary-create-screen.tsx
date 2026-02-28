'use client';

import { Button, Text, TextField } from '@1d1s/design-system';
import {
  Bold,
  CalendarDays,
  ChevronRight,
  Flame,
  ImagePlus,
  Info,
  Italic,
  List,
  ListOrdered,
  Underline,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useChallengeDetail } from '../../../challenge/board/hooks/use-challenge-queries';
import { Feeling } from '../../board/type/diary';
import {
  useCreateDiary,
  useUpdateDiary,
} from '../../detail/hooks/use-diary-mutations';
import { useDiaryDetail } from '../../board/hooks/use-diary-queries';
import type { MoodOption } from '../consts/diary-create-data';
import {
  DIARY_CREATE_INITIAL_CONTENT,
  DIARY_CREATE_MOOD_OPTIONS,
} from '../consts/diary-create-data';

interface GoalItem {
  id: number;
  label: string;
  done: boolean;
}

function GoalRow({
  goal,
  onToggle,
}: {
  goal: GoalItem;
  onToggle(id: number): void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={() => onToggle(goal.id)}
      className="flex w-full items-center gap-3 border-b border-gray-200 px-4 py-3 text-left last:border-b-0"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
          goal.done
            ? 'bg-main-800 text-white'
            : 'border border-gray-300 text-gray-300'
        }`}
      >
        {goal.done ? '✓' : ''}
      </span>
      <Text
        size="body1"
        weight="medium"
        className={goal.done ? 'text-gray-900' : 'text-gray-500'}
      >
        {goal.label}
      </Text>
    </button>
  );
}

function MoodButton({
  option,
  active,
  onClick,
}: {
  option: MoodOption;
  active: boolean;
  onClick(): void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2 relative flex h-[92px] w-[92px] flex-col items-center justify-center border transition ${
        active
          ? 'border-main-800 bg-main-100 text-main-800'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {active ? (
        <span className="bg-main-800 absolute top-1 right-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white">
          PICK
        </span>
      ) : null}
      <span className="text-3xl">{option.emoji}</span>
      <Text size="caption2" weight="medium" className="mt-1">
        {option.label}
      </Text>
    </button>
  );
}

function moodToFeeling(moodId: string): Feeling {
  if (moodId === 'hard') {
    return 'SAD';
  }
  if (moodId === 'normal') {
    return 'NORMAL';
  }
  return 'HAPPY';
}

function feelingToMood(feeling: Feeling): string {
  if (feeling === 'SAD') {
    return 'hard';
  }
  if (feeling === 'NORMAL') {
    return 'normal';
  }
  return 'good';
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DiaryCreateScreen(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const diaryIdParam = Number(searchParams.get('diaryId') ?? searchParams.get('id') ?? 0);
  const challengeIdParam = Number(searchParams.get('challengeId') ?? 0);
  const isEditMode = Number.isFinite(diaryIdParam) && diaryIdParam > 0;

  const { data: existingDiary } = useDiaryDetail(diaryIdParam);
  const challengeIdForGoals =
    challengeIdParam > 0
      ? challengeIdParam
      : existingDiary?.challenge.challengeId ?? 0;
  const { data: challengeData } = useChallengeDetail(challengeIdForGoals);

  const createDiary = useCreateDiary();
  const updateDiary = useUpdateDiary();

  const [title, setTitle] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('good');
  const [content, setContent] = useState<string>(DIARY_CREATE_INITIAL_CONTENT);
  const [achievedDate, setAchievedDate] = useState<string>(getToday());
  const [selectedGoalIds, setSelectedGoalIds] = useState<number[]>([]);

  useEffect(() => {
    if (!existingDiary) {
      return;
    }

    setTitle(existingDiary.title);
    setContent(existingDiary.content || '');
    setSelectedMood(feelingToMood(existingDiary.diaryInfo.feeling));
    setAchievedDate(existingDiary.diaryInfo.challengedDate || getToday());
    setSelectedGoalIds(existingDiary.diaryInfo.achievement ?? []);
  }, [existingDiary]);

  const displayChallenge = challengeData?.challengeSummary ?? existingDiary?.challenge;
  const goalItems = useMemo<GoalItem[]>(() => {
    const goals = challengeData?.challengeGoals ?? [];

    return goals.map((goal) => ({
      id: goal.challengeGoalId,
      label: goal.content,
      done: selectedGoalIds.includes(goal.challengeGoalId),
    }));
  }, [challengeData?.challengeGoals, selectedGoalIds]);

  const toggleGoal = (goalId: number): void => {
    setSelectedGoalIds((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSubmit = (): void => {
    const effectiveChallengeId = displayChallenge?.challengeId;
    if (!effectiveChallengeId) {
      toast.error('챌린지를 먼저 선택해 주세요.');
      return;
    }

    if (!title.trim()) {
      toast.error('일지 제목을 입력해 주세요.');
      return;
    }

    if (!content.trim()) {
      toast.error('일지 내용을 입력해 주세요.');
      return;
    }

    const payload = {
      challengeId: effectiveChallengeId,
      title: title.trim(),
      content: content.trim(),
      feeling: moodToFeeling(selectedMood),
      isPublic: true,
      achievedDate,
      achievedGoalIds: selectedGoalIds,
    };

    if (isEditMode) {
      updateDiary.mutate(
        { id: diaryIdParam, data: payload },
        {
          onSuccess: () => {
            toast.success('일지를 수정했습니다.');
            router.push(`/diary/${diaryIdParam}`);
          },
          onError: () => {
            toast.error('일지 수정에 실패했습니다.');
          },
        }
      );
      return;
    }

    createDiary.mutate(payload, {
      onSuccess: (createdDiary) => {
        toast.success('일지를 작성했습니다.');
        router.push(`/diary/${createdDiary.id}`);
      },
      onError: () => {
        toast.error('일지 작성에 실패했습니다.');
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-8 pb-32 md:px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <Text size="display2" weight="bold" className="text-gray-900">
            {isEditMode ? '일지 수정' : '일지 작성'}
          </Text>
          <Text size="body1" weight="regular" className="text-gray-600">
            오늘 하루의 도전을 기록하고 마무리하세요.
          </Text>
        </div>

        <div className="mt-10 flex flex-col gap-10">
          <section>
            <Text size="heading2" weight="bold" className="mb-3 text-gray-900">
              일지 제목
            </Text>
            <TextField
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="일지 제목을 입력하세요"
              className="w-full"
            />
          </section>

          <section>
            <Text size="heading2" weight="bold" className="mb-3 text-gray-900">
              연동된 챌린지
            </Text>
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="bg-main-200 text-main-800 flex h-14 w-14 items-center justify-center rounded-xl">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <Text size="heading1" weight="bold" className="text-gray-900">
                    {displayChallenge?.title ?? '선택된 챌린지가 없습니다'}
                  </Text>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-caption1 rounded-lg bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
                      {displayChallenge?.category ?? '-'}
                    </span>
                    <span className="bg-main-100 text-caption1 text-main-800 rounded-lg px-2 py-0.5 font-bold">
                      {displayChallenge?.startDate ?? '-'}
                    </span>
                  </div>
                </div>
              </div>
              {displayChallenge?.challengeId ? (
                <button
                  type="button"
                  className="flex items-center gap-1 text-gray-600 transition hover:text-gray-800"
                  onClick={() =>
                    router.push(`/challenge/${displayChallenge.challengeId}`)
                  }
                >
                  <Text size="body2" weight="medium">
                    보기
                  </Text>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </section>

          <section>
            <Text size="heading2" weight="bold" className="mb-3 text-gray-900">
              오늘의 달성 목표
            </Text>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {goalItems.length > 0 ? (
                goalItems.map((goal) => (
                  <GoalRow key={goal.id} goal={goal} onToggle={toggleGoal} />
                ))
              ) : (
                <div className="px-4 py-6 text-gray-500">
                  <Text size="body2" weight="regular">
                    챌린지 목표 정보를 불러오지 못했습니다.
                  </Text>
                </div>
              )}
            </div>
          </section>

          <section>
            <Text size="heading2" weight="bold" className="mb-3 text-gray-900">
              상세 내용
            </Text>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-3">
                <button
                  type="button"
                  aria-label="굵게"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="기울임"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="밑줄"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                >
                  <Underline className="h-4 w-4" />
                </button>

                <div className="mx-2 h-7 w-px bg-gray-200" />

                <button
                  type="button"
                  aria-label="불릿 리스트"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="번호 리스트"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="이미지 삽입"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>

              <div className="relative min-h-[420px] p-4">
                <textarea
                  className="text-body1 h-[380px] w-full resize-none border-0 p-0 text-gray-700 outline-none"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="오늘 챌린지를 진행하며 느낀 점을 기록해보세요."
                />
              </div>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <Text size="heading1" weight="bold" className="text-gray-900">
              일지 마무리
            </Text>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <Text
                  size="body1"
                  weight="medium"
                  className="mb-2 text-gray-700"
                >
                  언제의 기록인가요?
                </Text>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <CalendarDays className="h-5 w-5 text-gray-500" />
                  <input
                    type="date"
                    value={achievedDate}
                    onChange={(event) => setAchievedDate(event.target.value)}
                    className="w-full border-0 bg-transparent text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <Text
                  size="body1"
                  weight="medium"
                  className="mb-2 text-gray-700"
                >
                  오늘의 기분은 어땠나요?
                </Text>
                <div className="flex flex-wrap gap-2">
                  {DIARY_CREATE_MOOD_OPTIONS.map((option) => (
                    <MoodButton
                      key={option.id}
                      option={option}
                      active={selectedMood === option.id}
                      onClick={() => setSelectedMood(option.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-gray-500">
            <Info className="h-4 w-4" />
            <Text size="body2" weight="medium">
              API와 연동되어 실제 데이터가 저장됩니다.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outlined" size="large" onClick={() => router.back()}>
              취소
            </Button>
            <Button
              size="large"
              onClick={handleSubmit}
              disabled={createDiary.isPending || updateDiary.isPending}
            >
              {isEditMode ? '수정 완료' : '작성 완료'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
