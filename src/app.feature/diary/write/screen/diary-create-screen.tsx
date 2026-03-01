'use client';

import { Button, DatePicker, Text, TextField } from '@1d1s/design-system';
import { ChevronRight, Flame } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useChallengeDetail } from '../../../challenge/board/hooks/use-challenge-queries';
import type { ChallengeListItem } from '../../../challenge/board/type/challenge';
import type { Feeling } from '../../board/type/diary';
import {
  useCreateDiary,
  useUploadDiaryImage,
} from '../../detail/hooks/use-diary-mutations';
import { ChallengeGoalToggle } from '../components/challenge-goal-toggle';
import { ChallengePicker } from '../components/challenge-picker';
import { DiaryContentEditor } from '../components/diary-content-editor';
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
  const uploadDiaryImage = useUploadDiaryImage();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Feeling>('NORMAL');
  const [achievedDate, setAchievedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isPublic, setIsPublic] = useState(true);

  const [selectedChallenge, setSelectedChallenge] =
    useState<ChallengeListItem | null>(null);
  const [achievedGoalIds, setAchievedGoalIds] = useState<number[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState('');

  const { data: challengeDetail } = useChallengeDetail(
    selectedChallenge?.challengeId ?? 0
  );
  const goals = challengeDetail?.challengeGoals ?? [];
  const isSubmitting = createDiary.isPending || uploadDiaryImage.isPending;

  useEffect(
    () => () => {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    },
    [thumbnailPreviewUrl]
  );

  const handleGoalToggle = (goalId: number, checked: boolean): void => {
    setAchievedGoalIds((prev) =>
      checked ? [...prev, goalId] : prev.filter((id) => id !== goalId)
    );
  };

  const handleThumbnailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0] ?? null;
    setThumbnailFile(file);
    setThumbnailPreviewUrl(file ? URL.createObjectURL(file) : '');
  };

  const clearThumbnail = (): void => {
    setThumbnailFile(null);
    setThumbnailPreviewUrl('');
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedChallenge || isSubmitting) {
      return;
    }

    try {
      const createdDiary = await createDiary.mutateAsync({
        challengeId: selectedChallenge.challengeId,
        title,
        content,
        feeling: selectedMood,
        isPublic,
        achievedDate: achievedDate ? formatDate(achievedDate) : '',
        achievedGoalIds,
      });

      if (thumbnailFile) {
        await uploadDiaryImage.mutateAsync({
          id: createdDiary.id,
          file: thumbnailFile,
        });
      }

      router.push('/diary');
    } catch (error) {
      console.error('일지 작성/썸네일 업로드 중 오류가 발생했습니다.', error);
    }
  };

  const submitButtonLabel = createDiary.isPending
    ? '작성 중...'
    : uploadDiaryImage.isPending
      ? '썸네일 업로드 중...'
      : '작성 완료';

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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
            <div className="flex min-w-0 flex-col gap-6">
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

              <section>
                <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
                  목표 리스트
                </Text>
                {goals.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    {goals.map((goal) => (
                      <div
                        key={goal.challengeGoalId}
                        className="border-b border-gray-200 px-4 py-3 last:border-b-0"
                      >
                        <ChallengeGoalToggle
                          checked={achievedGoalIds.includes(
                            goal.challengeGoalId
                          )}
                          onCheckedChange={(checked) =>
                            handleGoalToggle(goal.challengeGoalId, checked)
                          }
                          label={goal.content}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5">
                    <Text size="body2" weight="regular" className="text-gray-500">
                      연동된 챌린지를 선택하면 목표 리스트가 표시됩니다.
                    </Text>
                  </div>
                )}
              </section>
            </div>

            <section className="lg:h-full">
              <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
                썸네일 이미지
              </Text>
              <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex min-h-[240px] flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 lg:min-h-[520px]">
                  {thumbnailPreviewUrl ? (
                    <Image
                      src={thumbnailPreviewUrl}
                      alt="썸네일 미리보기"
                      width={1200}
                      height={672}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-gray-500">
                      대표 썸네일 이미지를 선택해주세요.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:font-medium file:text-gray-700 hover:file:bg-gray-300"
                  />
                  {thumbnailFile ? (
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={clearThumbnail}
                    >
                      선택 해제
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>
          </div>

          <section>
            <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
              상세 내용
            </Text>
            <DiaryContentEditor
              content={content}
              onChange={setContent}
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
            onClick={() => void handleSubmit()}
            disabled={!selectedChallenge || !title || isSubmitting}
          >
            {submitButtonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
