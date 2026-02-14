'use client';

import React, { useState } from 'react';
import { Button, Text, TextField } from '@1d1s/design-system';
import {
  Bold,
  CalendarDays,
  Camera,
  ChevronRight,
  Flame,
  ImagePlus,
  Info,
  Italic,
  List,
  ListOrdered,
  Underline,
} from 'lucide-react';
import {
  DIARY_CREATE_INITIAL_CONTENT,
  DIARY_CREATE_INITIAL_GOALS,
  DIARY_CREATE_MOOD_OPTIONS,
} from '../consts/diary-create-data';
import type { GoalItem, MoodOption } from '../consts/diary-create-data';

function GoalRow({ goal }: { goal: GoalItem }): React.ReactElement {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 last:border-b-0">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
          goal.done ? 'bg-main-800 text-white' : 'border border-gray-300 text-gray-300'
        }`}
      >
        {goal.done ? '✓' : ''}
      </span>
      <Text size="body1" weight="medium" className={goal.done ? 'text-gray-900' : 'text-gray-500'}>
        {goal.label}
      </Text>
    </div>
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
      className={`relative flex h-[92px] w-[92px] flex-col items-center justify-center rounded-2 border transition ${
        active
          ? 'border-main-800 bg-main-100 text-main-800'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {active ? (
        <span className="absolute top-1 right-1 rounded-full bg-main-800 px-1.5 py-0.5 text-[10px] font-bold text-white">
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

export default function DiaryCreate(): React.ReactElement {
  const [selectedMood, setSelectedMood] = useState<string>('good');
  const [content, setContent] = useState<string>(DIARY_CREATE_INITIAL_CONTENT);

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-[1080px] px-4 py-6 pb-28">
        <div className="flex flex-col gap-1">
          <Text size="display2" weight="bold" className="text-gray-900">
            일지 작성
          </Text>
          <Text size="body1" weight="regular" className="text-gray-600">
            오늘 하루의 도전을 기록하고 마무리하세요.
          </Text>
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <section>
            <Text size="heading2" weight="bold" className="mb-3 text-gray-900">
              일지 제목
            </Text>
            <TextField value="고라니 밥주기 3일차 성공!" readOnly className="w-full" />
          </section>

          <section>
            <Text size="heading2" weight="bold" className="mb-3 text-gray-900">
              연동된 챌린지
            </Text>
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-main-200 text-main-800">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <Text size="heading1" weight="bold" className="text-gray-900">
                    고라니 밥주기 챌린지
                  </Text>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-caption1 font-medium text-gray-600">
                      습관 형성
                    </span>
                    <span className="rounded-lg bg-main-100 px-2 py-0.5 text-caption1 font-bold text-main-800">
                      Day 3
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-gray-600 transition hover:text-gray-800"
              >
                <Text size="body2" weight="medium">
                  변경
                </Text>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section>
            <Text size="heading2" weight="bold" className="mb-3 text-gray-900">
              오늘의 달성 목표
            </Text>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {DIARY_CREATE_INITIAL_GOALS.map((goal) => (
                <GoalRow key={goal.id} goal={goal} />
              ))}
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
                  className="h-[380px] w-full resize-none border-0 p-0 text-body1 text-gray-700 outline-none"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
                <button
                  type="button"
                  aria-label="카메라 열기"
                  className="absolute right-5 bottom-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-100"
                >
                  <Camera className="h-6 w-6" />
                </button>
              </div>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6">
            <Text size="heading1" weight="bold" className="text-gray-900">
              일지 마무리
            </Text>

            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <Text size="body1" weight="medium" className="mb-2 text-gray-700">
                  언제의 기록인가요?
                </Text>
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <Text size="heading2" weight="bold" className="text-gray-800">
                    10/27/2023
                  </Text>
                  <CalendarDays className="h-5 w-5 text-gray-500" />
                </div>
              </div>

              <div>
                <Text size="body1" weight="medium" className="mb-2 text-gray-700">
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
        <div className="mx-auto flex w-full max-w-[1080px] items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Info className="h-4 w-4" />
            <Text size="body2" weight="medium">
              작성 중인 내용은 자동 저장됩니다.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outlined" size="large">
              임시 저장
            </Button>
            <Button size="large">작성 완료</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
