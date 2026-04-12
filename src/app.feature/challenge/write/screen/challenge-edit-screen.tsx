'use client';

import {
  Button,
  GoalAddList,
  ImagePicker,
  Text,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@1d1s/design-system';
import { MaxParticipantCountSelect } from '@feature/challenge/write/components/max-participant-count-select';
import { getCategoryLabel } from '@constants/categories';
import { useChallengeDetail } from '@feature/challenge/board/hooks/use-challenge-queries';
import { isChallengeOngoing } from '@feature/challenge/board/utils/challenge-period';
import { useUpdateChallenge } from '@feature/challenge/detail/hooks/use-challenge-mutations';
import { notifyApiError } from '@module/api/error';
import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';
import { authStorage } from '@module/utils/auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { ChallengeCategory, UpdateChallengeRequest } from '../../board/type/challenge';

const CATEGORY_OPTIONS: Array<{ value: ChallengeCategory; label: string }> = [
  { value: 'DEV', label: getCategoryLabel('DEV') },
  { value: 'EXERCISE', label: getCategoryLabel('EXERCISE') },
  { value: 'BOOK', label: getCategoryLabel('BOOK') },
  { value: 'MUSIC', label: getCategoryLabel('MUSIC') },
  { value: 'STUDY', label: getCategoryLabel('STUDY') },
  { value: 'LEISURE', label: getCategoryLabel('LEISURE') },
  { value: 'ECONOMY', label: getCategoryLabel('ECONOMY') },
];

interface ChallengeEditScreenProps {
  id: string;
}

export default function ChallengeEditScreen({
  id,
}: ChallengeEditScreenProps): React.ReactElement {
  const router = useRouter();
  const challengeId = Number(id);
  const { data, isLoading, isError } = useChallengeDetail(challengeId);
  const updateChallenge = useUpdateChallenge();

  const summary = data?.challengeSummary;
  const detail = data?.challengeDetail;
  const goals = data?.challengeGoals ?? [];

  // 시작 여부
  const isChallengeStarted = isChallengeOngoing(
    summary?.startDate,
    summary?.endDate
  );
  const isGroupChallenge = (summary?.maxParticipantCnt ?? 0) > 1;
  const isFixedGoal = summary?.challengeType === 'FIXED';

  // 폼 상태
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ChallengeCategory>('DEV');
  const [description, setDescription] = useState('');
  const [allowMidJoin, setAllowMidJoin] = useState(false);
  const [memberCount, setMemberCount] = useState('');
  const [memberCountNumber, setMemberCountNumber] = useState('');
  const [goalInputs, setGoalInputs] = useState<string[]>([]);

  // 썸네일 상태
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<
    string | undefined
  >();
  const [thumbnailAction, setThumbnailAction] = useState<
    'keep' | 'update' | 'remove'
  >('keep');
  const [newThumbnailKey, setNewThumbnailKey] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);

  const [isInitialized, setIsInitialized] = useState(false);

  // 데이터 로드 후 폼 초기화
  useEffect(() => {
    if (!summary || !detail || isInitialized) {
      return;
    }

    setTitle(summary.title);
    setCategory(summary.category);
    setDescription(detail.description ?? '');
    setAllowMidJoin(summary.allowMidJoin ?? false);
    const cnt = summary.maxParticipantCnt;
    if (cnt === 2 || cnt === 5 || cnt === 10) {
      setMemberCount(String(cnt));
    } else {
      setMemberCount('etc');
      setMemberCountNumber(String(cnt));
    }
    setGoalInputs(goals.map((g) => g.content));
    setThumbnailPreviewUrl(summary.thumbnailImage ?? undefined);
    setIsInitialized(true);
  }, [summary, detail, goals, isInitialized]);

  // HOST 체크
  useEffect(() => {
    if (!data) {
      return;
    }
    if (data.challengeDetail.myStatus !== 'HOST') {
      router.replace(`/challenge/${id}`);
    }
  }, [data, id, router]);

  const handleThumbnailSelect = async (file: File): Promise<void> => {
    setIsUploading(true);
    try {
      const { presignedUrl, objectKey } = await requestData<{
        presignedUrl: string;
        objectKey: string;
      }>(apiClient, {
        url: '/image/presigned-url',
        method: 'POST',
        data: { fileName: file.name, fileType: file.type },
      });

      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'image/jpeg' },
      });

      setNewThumbnailKey(objectKey);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
      setThumbnailAction('update');
    } catch {
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleThumbnailClear = (): void => {
    setThumbnailPreviewUrl(undefined);
    setNewThumbnailKey(undefined);
    setThumbnailAction('remove');
  };

  const handleSubmit = (): void => {
    if (!authStorage.hasTokens()) {
      router.replace('/login');
      return;
    }

    if (!title.trim()) {
      toast.error('챌린지 제목을 입력해주세요.');
      return;
    }

    const payload: UpdateChallengeRequest = {};

    if (title.trim() !== summary?.title) {
      payload.title = title.trim();
    }
    if (category !== summary?.category) {
      payload.category = category;
    }
    if (description.trim() !== (detail?.description ?? '')) {
      payload.description = description.trim();
    }
    if (isGroupChallenge && allowMidJoin !== (summary?.allowMidJoin ?? false)) {
      payload.allowMidJoin = allowMidJoin;
    }
    if (isGroupChallenge && !isChallengeStarted) {
      const resolved = memberCount === 'etc' ? memberCountNumber : memberCount;
      const parsed = Number(resolved);
      if (!Number.isNaN(parsed) && parsed >= 2 && parsed !== summary?.maxParticipantCnt) {
        payload.maxParticipantCnt = parsed;
      }
    }
    if (!isChallengeStarted && isFixedGoal) {
      payload.goals = goalInputs.filter((g) => g.trim());
    }
    if (thumbnailAction === 'update' && newThumbnailKey) {
      payload.thumbnailImage = newThumbnailKey;
    } else if (thumbnailAction === 'remove') {
      payload.thumbnailImage = null;
    }

    updateChallenge.mutate(
      { challengeId, data: payload },
      {
        onSuccess: () => {
          toast.success('챌린지가 수정되었습니다.');
          router.push(`/challenge/${id}`);
        },
        onError: (error) => {
          notifyApiError(error);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Text size="body1" weight="medium" className="text-gray-500">
          불러오는 중...
        </Text>
      </div>
    );
  }

  if (isError || !summary || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <Text size="body1" weight="medium" className="text-red-500">
          챌린지 정보를 불러오지 못했습니다.
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-[720px] space-y-8 px-4 py-6">
        {isChallengeStarted && (
          <div className="rounded-3 bg-amber-50 px-4 py-3">
            <Text size="body2" weight="medium" className="text-amber-700">
              챌린지가 시작된 이후에는 목표를 수정할 수 없습니다.
            </Text>
          </div>
        )}

        {/* 대표 사진 */}
        <div className="flex flex-col gap-2">
          <Text size="body1" weight="bold" className="text-gray-900">
            대표 사진 <span className="text-gray-400 font-normal">(선택)</span>
          </Text>
          <ImagePicker
            previewUrl={thumbnailPreviewUrl}
            onSelectFile={handleThumbnailSelect}
            onClear={handleThumbnailClear}
            placeholderTitle="클릭하여 대표 사진을 추가하세요."
            placeholderSubtitle="또는 이미지를 드래그해서 놓아주세요."
            clearLabel="사진 제거"
            dropZoneClassName="aspect-[4/1]"
          />
          {isUploading && (
            <Text size="caption1" weight="regular" className="text-gray-500">
              업로드 중...
            </Text>
          )}
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <Text size="body1" weight="bold" className="text-gray-900">
            챌린지 제목 <span className="text-main-800">*</span>
          </Text>
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="챌린지 제목을 입력해주세요."
            className="w-full"
            maxLength={50}
          />
        </div>

        {/* 카테고리 */}
        <div className="flex flex-col gap-2">
          <Text size="body1" weight="bold" className="text-gray-900">
            카테고리
          </Text>
          <ToggleGroup
            type="single"
            value={category}
            onValueChange={(value) => {
              if (value) setCategory(value as ChallengeCategory);
            }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* 설명 */}
        <div className="flex flex-col gap-2">
          <Text size="body1" weight="bold" className="text-gray-900">
            설명 <span className="text-gray-400 font-normal">(선택)</span>
          </Text>
          <TextField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="챌린지 소개와 진행 방법을 자유롭게 적어주세요."
            multiline
            rows={4}
            className="w-full"
            maxLength={200}
          />
        </div>

        {/* 단체 챌린지 전용 옵션 */}
        {isGroupChallenge && (
          <>
            <div className="flex flex-col gap-2">
              <Text size="body1" weight="bold" className="text-gray-900">
                중간 참여 허용
              </Text>
              <ToggleGroup
                type="single"
                value={allowMidJoin ? 'yes' : 'no'}
                onValueChange={(value) => {
                  if (value) setAllowMidJoin(value === 'yes');
                }}
                className="w-fit"
              >
                <ToggleGroupItem value="yes">허용</ToggleGroupItem>
                <ToggleGroupItem value="no">미허용</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {!isChallengeStarted && (
              <div className="flex flex-col gap-2">
                <Text size="body1" weight="bold" className="text-gray-900">
                  최대 참여 인원
                </Text>
                <MaxParticipantCountSelect
                  value={memberCount}
                  onValueChange={setMemberCount}
                  customValue={memberCountNumber}
                  onCustomValueChange={setMemberCountNumber}
                />
              </div>
            )}
          </>
        )}

        {/* 목표 (시작 전 + FIXED 타입만) */}
        {!isChallengeStarted && isFixedGoal && (
          <div className="flex flex-col gap-2">
            <Text size="body1" weight="bold" className="text-gray-900">
              목표
            </Text>
            <GoalAddList
              goals={goalInputs}
              onGoalsChange={setGoalInputs}
              placeholder="목표를 입력하고 Enter를 눌러 추가하세요"
              inputAriaLabel="목표 입력"
              maxGoals={10}
            />
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex justify-end pb-8">
          <Button
            size="large"
            onClick={handleSubmit}
            disabled={
              updateChallenge.isPending || isUploading || !title.trim()
            }
          >
            {updateChallenge.isPending ? '저장 중...' : '수정 완료'}
          </Button>
        </div>
      </div>
    </div>
  );
}
