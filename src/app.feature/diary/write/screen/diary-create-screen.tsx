'use client';

import { Button, DatePicker, Text, TextField } from '@1d1s/design-system';
import {
  Bold,
  ChevronRight,
  Flame,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Underline,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';

import { useChallengeDetail } from '../../../challenge/board/hooks/use-challenge-queries';
import type { ChallengeListItem } from '../../../challenge/board/type/challenge';
import type { Feeling } from '../../board/type/diary';
import { useCreateDiary } from '../../detail/hooks/use-diary-mutations';
import { ChallengeGoalToggle } from '../components/challenge-goal-toggle';
import { ChallengePicker } from '../components/challenge-picker';
import type { MoodOption } from '../consts/diary-create-data';
import { DIARY_CREATE_MOOD_OPTIONS } from '../consts/diary-create-data';

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

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function DiaryCreateScreen(): React.ReactElement {
  const router = useRouter();
  const createDiary = useCreateDiary();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Feeling>('NORMAL');
  const [achievedDate, setAchievedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isPublic, setIsPublic] = useState(true);
  const [images, setImages] = useState<File[]>([]);

  const [selectedChallenge, setSelectedChallenge] =
    useState<ChallengeListItem | null>(null);
  const [achievedGoalIds, setAchievedGoalIds] = useState<number[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: challengeDetail } = useChallengeDetail(
    selectedChallenge?.challengeId ?? 0
  );
  const goals = challengeDetail?.challengeGoals ?? [];

  const handleGoalToggle = (goalId: number, checked: boolean): void => {
    setAchievedGoalIds((prev) =>
      checked ? [...prev, goalId] : prev.filter((id) => id !== goalId)
    );
  };

  // --- 텍스트 에디터 스텁 메서드 (추후 리치 텍스트 에디터 연동) ---
  const handleBold = (): void => {
    // TODO: 볼드 서식 적용
  };

  const handleItalic = (): void => {
    // TODO: 이탤릭 서식 적용
  };

  const handleUnderline = (): void => {
    // TODO: 밑줄 서식 적용
  };

  const handleBulletList = (): void => {
    // TODO: 불릿 리스트 적용
  };

  const handleOrderedList = (): void => {
    // TODO: 번호 리스트 적용
  };

  // --- 이미지 업로드 스텁 메서드 (추후 API 연동) ---
  const handleImageSelect = (): void => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = event.target.files;
    if (!files) {
      return;
    }
    setImages((prev) => [...prev, ...Array.from(files)]);
    event.target.value = '';
  };

  const handleImageRemove = (index: number): void => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (): void => {
    if (!selectedChallenge) {
      return;
    }

    createDiary.mutate(
      {
        challengeId: selectedChallenge.challengeId,
        title,
        content,
        feeling: selectedMood,
        isPublic,
        achievedDate: achievedDate ? formatDate(achievedDate) : '',
        achievedGoalIds,
      },
      {
        onSuccess: () => {
          router.push('/diary');
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-[1080px] px-4 py-8 pb-28">
        <div className="flex flex-col gap-2">
          <Text size="display2" weight="bold" className="text-gray-900">
            일지 작성
          </Text>
          <Text size="body1" weight="regular" className="text-gray-600">
            오늘 하루의 도전을 기록하고 마무리하세요.
          </Text>
        </div>

        <div className="mt-12 flex flex-col gap-12">
          <section>
            <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
              일지 제목
            </Text>
            <TextField
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="일지 제목을 입력해주세요."
              className="w-full"
            />
          </section>

          <section>
            <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
              연동된 챌린지
            </Text>
            {selectedChallenge ? (
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="bg-main-200 text-main-800 flex h-14 w-14 items-center justify-center rounded-xl">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <Text
                      size="heading1"
                      weight="bold"
                      className="text-gray-900"
                    >
                      {selectedChallenge.title}
                    </Text>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-caption1 rounded-lg bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
                        {selectedChallenge.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-gray-600 transition hover:text-gray-800"
                  onClick={() => {
                    setSelectedChallenge(null);
                    setAchievedGoalIds([]);
                  }}
                >
                  <Text size="body2" weight="medium">
                    변경
                  </Text>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <ChallengePicker
                onSelect={(challenge) => {
                  setSelectedChallenge(challenge);
                  setAchievedGoalIds([]);
                }}
              />
            )}
          </section>

          {goals.length > 0 && (
            <section>
              <Text
                size="heading2"
                weight="bold"
                className="mb-6 text-gray-900"
              >
                오늘의 달성 목표
              </Text>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {goals.map((goal) => (
                  <div
                    key={goal.challengeGoalId}
                    className="border-b border-gray-200 px-4 py-3 last:border-b-0"
                  >
                    <ChallengeGoalToggle
                      checked={achievedGoalIds.includes(goal.challengeGoalId)}
                      onCheckedChange={(checked) =>
                        handleGoalToggle(goal.challengeGoalId, checked)
                      }
                      label={goal.content}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
              상세 내용
            </Text>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-3">
                <button
                  type="button"
                  aria-label="굵게"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                  onClick={handleBold}
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="기울임"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                  onClick={handleItalic}
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="밑줄"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                  onClick={handleUnderline}
                >
                  <Underline className="h-4 w-4" />
                </button>

                <div className="mx-2 h-7 w-px bg-gray-200" />

                <button
                  type="button"
                  aria-label="불릿 리스트"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                  onClick={handleBulletList}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="번호 리스트"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                  onClick={handleOrderedList}
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="이미지 삽입"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                  onClick={handleImageSelect}
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-[420px] p-4">
                <textarea
                  className="text-body1 h-[380px] w-full resize-none border-0 p-0 text-gray-700 outline-none"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="오늘 챌린지를 진행하며 느낀 점이나 있었던 일을 자유롭게 기록해보세요."
                />
              </div>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 border-t border-gray-200 p-4">
                  {images.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="group relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white opacity-0 transition group-hover:opacity-100"
                        onClick={() => handleImageRemove(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </section>

          <section className="border-t border-gray-200 pt-8">
            <Text size="heading1" weight="bold" className="text-gray-900">
              일지 마무리
            </Text>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <Text
                  size="body1"
                  weight="medium"
                  className="mb-4 text-gray-700"
                >
                  언제의 기록인가요?
                </Text>
                <DatePicker
                  value={achievedDate}
                  onChange={(date) => setAchievedDate(date)}
                  placeholder="날짜를 선택해주세요"
                />
              </div>

              <div>
                <Text
                  size="body1"
                  weight="medium"
                  className="mb-4 text-gray-700"
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

            <div className="mt-6 flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="isPublic">
                <Text size="body2" weight="medium" className="text-gray-700">
                  일지를 공개합니다
                </Text>
              </label>
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1080px] items-center justify-end px-4 py-4">
          <Button
            size="large"
            onClick={handleSubmit}
            disabled={!selectedChallenge || !title || createDiary.isPending}
          >
            {createDiary.isPending ? '작성 중...' : '작성 완료'}
          </Button>
        </div>
      </div>
    </div>
  );
}
