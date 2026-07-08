import { isChallengeOngoing } from '@feature/challenge/board/utils/challengePeriod';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { uploadImagesViaPresigned } from '@module/api/presignedUpload';
import { toast } from '@module/providers/toast';
import { formatDateISO } from '@module/utils/date';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  useChallengeCheckWriteDates,
  useChallengeDetail,
} from '../../../challenge/board/hooks/useChallengeQueries';
import type {
  ChallengeGoal,
  ChallengeListItem,
} from '../../../challenge/board/type/challenge';
import {
  useAllDiaries,
  useDiaryDetail,
} from '../../board/hooks/useDiaryQueries';
import type { Feeling } from '../../board/type/diary';
import {
  useCreateDiary,
  useUpdateDiary,
} from '../../detail/hooks/useDiaryMutations';
import { resolveDiaryImageUrl } from '../../shared/utils/diaryImageUrl';
import type { DiaryImageItem } from '../utils/diaryFormHelpers';
import {
  getDiaryImageUrls,
  getDiaryInfo,
  getFirstSelectableAchievedDate,
  getSubmitButtonLabel,
  hasSelectableAchievedDate,
  isSelectableAchievedDate,
  mapDiaryChallengeToChallengeListItem,
  mapSidebarChallengeToChallengeListItem,
  parsePositiveInteger,
  revokeObjectUrlIfNeeded,
} from '../utils/diaryFormHelpers';

const EMPTY_GOALS: ChallengeGoal[] = [];

interface UseDiaryCreateFormResult {
  isEditMode: boolean;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  selectedMood: Feeling;
  setSelectedMood: Dispatch<SetStateAction<Feeling>>;
  achievedDate: Date | undefined;
  setAchievedDate: Dispatch<SetStateAction<Date | undefined>>;
  selectedChallenge: ChallengeListItem | null;
  memberChallenges: ChallengeListItem[];
  isMemberChallengesLoading: boolean;
  isInitialChallengeLoading: boolean;
  isCheckingChallengeAvailability: boolean;
  /** 챌린지 선택 후 checkWrite 확인이 완료되고 작성 가능한 날짜가 있을 때 true */
  isSelectedChallengeConfirmed: boolean;
  goals: ChallengeGoal[];
  achievedGoalIds: number[];
  disabledAchievedDateKeys: string[];
  imagePreviewUrls: string[];
  /** imagePreviewUrls 중 대표 썸네일 인덱스(없으면 -1). */
  thumbnailIndex: number;
  submitButtonLabel: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  isMissingChallengeDialogOpen: boolean;
  isCreateUnavailableDialogOpen: boolean;
  handleSelectChallenge(challenge: ChallengeListItem): void;
  handleClearChallenge(): void;
  handleGoalIdsChange(goalIds: number[]): void;
  handleAchievedDateChange(date: Date | undefined): void;
  isAchievedDateDisabled(date: Date): boolean;
  handleAddImageFiles(files: File[]): void;
  handleRemoveImageAt(index: number): void;
  handleSelectThumbnailAt(index: number): void;
  closeMissingChallengeDialog(): void;
  closeCreateUnavailableDialog(): void;
  handleSubmit(): Promise<void>;
}

export function useDiaryCreateForm(): UseDiaryCreateFormResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requestedDiaryId] = useState<number | null>(() =>
    parsePositiveInteger(searchParams.get('diaryId'))
  );
  const isEditMode = requestedDiaryId !== null;
  const createDiary = useCreateDiary();
  const updateDiary = useUpdateDiary();
  const [requestedChallengeId] = useState<number | null>(() =>
    parsePositiveInteger(searchParams.get('challengeId'))
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Feeling>('NORMAL');
  const [achievedDate, setAchievedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(
    requestedChallengeId
  );
  const [
    isMissingChallengeDialogDismissed,
    setIsMissingChallengeDialogDismissed,
  ] = useState(false);
  const [isCreateUnavailableDialogOpen, setIsCreateUnavailableDialogOpen] =
    useState(false);
  const [isEditFormInitialized, setIsEditFormInitialized] = useState(false);
  const [achievedGoalIds, setAchievedGoalIds] = useState<number[]>([]);
  const [images, setImages] = useState<DiaryImageItem[]>([]);
  // 대표 썸네일로 지정된 이미지의 url(existing=raw, new=objectURL).
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(
    null
  );
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  // 언마운트 시 신규 이미지 objectURL 정리를 위한 최신 참조.
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const submitSuccessRef = useRef(false);
  const unavailableDialogShownForChallengeIdRef = useRef<number | null>(null);

  const { data: existingDiary, isLoading: isExistingDiaryLoading } =
    useDiaryDetail(requestedDiaryId ?? 0);

  const { data: myDiaries = [], isLoading: isMyDiariesLoading } = useAllDiaries(
    {
      enabled: requestedChallengeId !== null,
    }
  );

  const requestedChallengeFromMyDiaries = useMemo(() => {
    if (requestedChallengeId === null) {
      return null;
    }

    const matchedDiary = myDiaries.find(
      (diary) => diary.challenge?.challengeId === requestedChallengeId
    );
    return matchedDiary?.challenge ?? null;
  }, [myDiaries, requestedChallengeId]);

  const { data: sidebarData, isLoading: isMemberChallengesLoading } =
    useSidebar();
  const memberChallenges = useMemo(
    () =>
      (sidebarData?.challengeList ?? []).map(
        mapSidebarChallengeToChallengeListItem
      ),
    [sidebarData]
  );
  const ongoingMemberChallenges = useMemo(
    () =>
      memberChallenges.filter((challenge) =>
        isChallengeOngoing(challenge.startDate, challenge.endDate)
      ),
    [memberChallenges]
  );
  const selectedChallenge = useMemo(() => {
    if (selectedChallengeId === null) {
      return null;
    }

    const memberChallenge =
      ongoingMemberChallenges.find(
        (challenge) => challenge.challengeId === selectedChallengeId
      ) ?? null;

    if (memberChallenge) {
      return memberChallenge;
    }

    const fallbackChallengeSummary =
      (requestedChallengeFromMyDiaries?.challengeId === selectedChallengeId
        ? requestedChallengeFromMyDiaries
        : null) ??
      (existingDiary?.challenge?.challengeId === selectedChallengeId
        ? existingDiary.challenge
        : null);

    return fallbackChallengeSummary
      ? mapDiaryChallengeToChallengeListItem(fallbackChallengeSummary)
      : null;
  }, [
    existingDiary,
    ongoingMemberChallenges,
    requestedChallengeFromMyDiaries,
    selectedChallengeId,
  ]);

  const { data: challengeDetail } = useChallengeDetail(
    selectedChallenge?.challengeId ?? 0
  );
  const {
    data: challengeCheckWriteDateKeys = [],
    isLoading: isChallengeCheckWriteDatesLoading,
  } = useChallengeCheckWriteDates(selectedChallenge?.challengeId ?? 0);
  const goals = challengeDetail?.challengeGoals ?? EMPTY_GOALS;

  const editModeDateKey = useMemo(() => {
    if (!isEditMode || !existingDiary) {
      return null;
    }

    const diaryInfo = getDiaryInfo(existingDiary);
    const baseDate = diaryInfo?.challengedDate ?? diaryInfo?.createdAt ?? '';
    const parsedDate = baseDate ? new Date(baseDate) : null;

    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return formatDateISO(parsedDate);
  }, [existingDiary, isEditMode]);

  const disabledAchievedDateKeys = useMemo(() => {
    const uniqueDateKeys = new Set(
      challengeCheckWriteDateKeys.filter((date) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date)
      )
    );

    if (editModeDateKey) {
      uniqueDateKeys.delete(editModeDateKey);
    }

    return Array.from(uniqueDateKeys);
  }, [challengeCheckWriteDateKeys, editModeDateKey]);

  const disabledAchievedDateKeySet = useMemo(
    () => new Set(disabledAchievedDateKeys),
    [disabledAchievedDateKeys]
  );
  const hasWritableRecentDate = hasSelectableAchievedDate(
    disabledAchievedDateKeySet,
    selectedChallenge?.startDate
  );
  const isCheckingChallengeAvailability =
    Boolean(selectedChallenge) && isChallengeCheckWriteDatesLoading;

  // checkWrite 확인 완료 + 작성 가능한 날짜 존재 여부
  // 수정 모드에선 editModeDateKey가 제외되므로 항상 true (로딩 완료 후)
  const isSelectedChallengeConfirmed =
    Boolean(selectedChallenge) &&
    !isChallengeCheckWriteDatesLoading &&
    (isEditMode || hasWritableRecentDate);

  const isSubmitting =
    createDiary.isPending || updateDiary.isPending || isUploadingImages;
  const trimmedTitle = title.trim();
  // 참여자가 0명이면 아카이브된 챌린지로 간주해 종료 처리한다.
  const isSelectedChallengeArchived = selectedChallenge
    ? selectedChallenge.participantCnt === 0
    : false;
  const isSelectedChallengeOngoing = selectedChallenge
    ? isChallengeOngoing(
        selectedChallenge.startDate,
        selectedChallenge.endDate
      ) && !isSelectedChallengeArchived
    : false;
  const canSubmit =
    Boolean(selectedChallenge) &&
    isSelectedChallengeOngoing &&
    trimmedTitle.length > 0 &&
    Boolean(achievedDate) &&
    (achievedDate
      ? isSelectableAchievedDate(achievedDate, selectedChallenge?.startDate) &&
        !disabledAchievedDateKeySet.has(formatDateISO(achievedDate))
      : false) &&
    !isChallengeCheckWriteDatesLoading &&
    !isSubmitting &&
    (!isEditMode || !isExistingDiaryLoading);
  const isInitialChallengeLoading =
    requestedChallengeId !== null &&
    selectedChallengeId === requestedChallengeId &&
    (isMemberChallengesLoading || isMyDiariesLoading);
  const isMissingChallengeDialogOpen =
    !isEditMode &&
    requestedChallengeId !== null &&
    !isMemberChallengesLoading &&
    !memberChallenges.some(
      (challenge) => challenge.challengeId === requestedChallengeId
    ) &&
    !isMissingChallengeDialogDismissed;

  useEffect(
    () => () => {
      imagesRef.current.forEach((image) => {
        if (image.kind === 'new') {
          revokeObjectUrlIfNeeded(image.url);
        }
      });
    },
    []
  );

  useEffect(() => {
    if (!isEditMode || isEditFormInitialized || !existingDiary) {
      return;
    }

    const diaryInfo = getDiaryInfo(existingDiary);
    const baseDate = diaryInfo?.challengedDate ?? diaryInfo?.createdAt ?? '';
    const parsedDate = baseDate ? new Date(baseDate) : null;
    const nextAchievedDate =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate
        : new Date();
    const nextImageUrls = getDiaryImageUrls(existingDiary);
    // 기존 대표 썸네일(raw). 목록에 있으면 그 값을, 없으면 첫 이미지로.
    const existingThumbnail = existingDiary.thumbnailUrl ?? null;
    const nextThumbnail =
      existingThumbnail && nextImageUrls.includes(existingThumbnail)
        ? existingThumbnail
        : nextImageUrls[0] ?? null;
    const timerId = window.setTimeout(() => {
      setTitle(existingDiary.title ?? '');
      setContent(existingDiary.content ?? '');
      setSelectedMood(diaryInfo?.feeling ?? 'NORMAL');
      setAchievedDate(nextAchievedDate);
      setSelectedChallengeId(existingDiary.challenge?.challengeId ?? null);
      const nextAchievedGoalIds =
        diaryInfo?.diaryGoal
          ?.filter((goal) => goal.isAchieved)
          ?.map((goal) => goal.challengeGoalId) ??
        diaryInfo?.achievement ??
        [];
      setAchievedGoalIds(nextAchievedGoalIds);
      setImages(
        nextImageUrls.map((url) => ({ kind: 'existing' as const, url }))
      );
      setThumbnailImageUrl(nextThumbnail);
      setIsEditFormInitialized(true);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [existingDiary, isEditFormInitialized, isEditMode]);

  useEffect(() => {
    if (
      isEditMode ||
      !selectedChallenge ||
      isMemberChallengesLoading ||
      isChallengeCheckWriteDatesLoading ||
      !isSelectedChallengeOngoing ||
      submitSuccessRef.current
    ) {
      return;
    }

    if (hasWritableRecentDate) {
      return;
    }

    // 진입 시점에 한 번만 띄운다. 같은 챌린지에서 작성 도중 mutation 등으로
    // checkWriteDates가 갱신되어 hasWritableRecentDate가 false 로 바뀌어도
    // 다시 다이얼로그가 뜨지 않도록 챌린지 단위로 가드한다.
    if (
      unavailableDialogShownForChallengeIdRef.current ===
      selectedChallenge.challengeId
    ) {
      return;
    }

    const timerId = window.setTimeout(() => {
      unavailableDialogShownForChallengeIdRef.current =
        selectedChallenge.challengeId;
      setIsCreateUnavailableDialogOpen(true);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    hasWritableRecentDate,
    isChallengeCheckWriteDatesLoading,
    isEditMode,
    isMemberChallengesLoading,
    isSelectedChallengeOngoing,
    selectedChallenge,
  ]);

  useEffect(() => {
    if (isEditMode || !selectedChallenge) {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (!achievedDate) {
        const firstSelectableDate = getFirstSelectableAchievedDate(
          disabledAchievedDateKeySet,
          selectedChallenge.startDate
        );
        if (firstSelectableDate) {
          setAchievedDate(firstSelectableDate);
        }
        return;
      }

      if (
        !isSelectableAchievedDate(achievedDate, selectedChallenge.startDate) ||
        disabledAchievedDateKeySet.has(formatDateISO(achievedDate))
      ) {
        setAchievedDate(
          getFirstSelectableAchievedDate(
            disabledAchievedDateKeySet,
            selectedChallenge.startDate
          )
        );
      }
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [achievedDate, disabledAchievedDateKeySet, isEditMode, selectedChallenge]);

  const handleSelectChallenge = useCallback((challenge: ChallengeListItem) => {
    unavailableDialogShownForChallengeIdRef.current = null;
    setSelectedChallengeId(challenge.challengeId);
    setAchievedGoalIds([]);
  }, []);

  const handleClearChallenge = useCallback(() => {
    unavailableDialogShownForChallengeIdRef.current = null;
    setSelectedChallengeId(null);
    setAchievedGoalIds([]);
  }, []);

  const handleGoalIdsChange = useCallback((goalIds: number[]) => {
    setAchievedGoalIds(goalIds);
  }, []);

  const handleAchievedDateChange = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        setAchievedDate(undefined);
        return;
      }

      if (!isSelectableAchievedDate(date, selectedChallenge?.startDate)) {
        return;
      }

      if (disabledAchievedDateKeySet.has(formatDateISO(date))) {
        return;
      }

      setAchievedDate(date);
    },
    [disabledAchievedDateKeySet, selectedChallenge?.startDate]
  );

  const isAchievedDateDisabled = useCallback(
    (date: Date) =>
      !isSelectableAchievedDate(date, selectedChallenge?.startDate) ||
      disabledAchievedDateKeySet.has(formatDateISO(date)),
    [disabledAchievedDateKeySet, selectedChallenge?.startDate]
  );

  const handleAddImageFiles = useCallback((files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const addedImages = files.map((file) => ({
      kind: 'new' as const,
      url: URL.createObjectURL(file),
      file,
    }));

    setImages((prevImages) => [...prevImages, ...addedImages]);
    // 대표가 아직 없으면(첫 이미지) 자동으로 첫 장을 대표로 지정.
    setThumbnailImageUrl((prev) => prev ?? addedImages[0].url);
  }, []);

  const handleRemoveImageAt = useCallback(
    (index: number) => {
      const target = images[index];
      if (target?.kind === 'new') {
        revokeObjectUrlIfNeeded(target.url);
      }

      const nextImages = images.filter((_, itemIndex) => itemIndex !== index);
      setImages(nextImages);

      // 대표를 삭제하면 남은 첫 이미지로 재지정(없으면 null).
      if (target && thumbnailImageUrl === target.url) {
        setThumbnailImageUrl(nextImages[0]?.url ?? null);
      }
    },
    [images, thumbnailImageUrl]
  );

  const handleSelectThumbnailAt = useCallback(
    (index: number) => {
      setThumbnailImageUrl(images[index]?.url ?? null);
    },
    [images]
  );

  const thumbnailIndex = useMemo(
    () => images.findIndex((image) => image.url === thumbnailImageUrl),
    [images, thumbnailImageUrl]
  );

  // existing 의 url 은 재전송용 raw 값이라, 표시할 때만 resolve 한다.
  // new 의 url 은 objectURL(blob:) 이라 그대로 쓴다.
  const imagePreviewUrls = useMemo(
    () =>
      images.map((image) =>
        image.kind === 'existing'
          ? resolveDiaryImageUrl(image.url) ?? image.url
          : image.url
      ),
    [images]
  );

  const closeMissingChallengeDialog = useCallback(() => {
    setIsMissingChallengeDialogDismissed(true);
  }, []);

  const closeCreateUnavailableDialog = useCallback(() => {
    setIsCreateUnavailableDialogOpen(false);
    unavailableDialogShownForChallengeIdRef.current = null;
    setSelectedChallengeId(null);
    setAchievedGoalIds([]);
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!selectedChallenge || !trimmedTitle || isSubmitting) {
      return;
    }

    if (
      achievedDate &&
      (!isSelectableAchievedDate(achievedDate, selectedChallenge.startDate) ||
        disabledAchievedDateKeySet.has(formatDateISO(achievedDate)))
    ) {
      return;
    }

    // mutation onSuccess 의 캐시 무효화가 마지막 작성 가능일을 사라지게 만들면
    // useEffect 가 'unavailable' 다이얼로그를 띄울 수 있다. 제출 시작 시점에
    // 가드를 올려, 제출-네비게이션 사이의 어떤 refetch 도 다이얼로그를
    // 트리거하지 못하게 한다. 실패 시에만 가드를 해제한다.
    submitSuccessRef.current = true;

    try {
      // 신규 파일만 presigned 업로드 → fileUrl 수집. 실패 시 diary 요청
      // 자체를 보내지 않는다(아래 catch 로 낙하).
      const newFiles = images
        .filter((image): image is DiaryImageItem & { file: File } =>
          image.kind === 'new' && Boolean(image.file)
        )
        .map((image) => image.file);

      let uploadedFileUrls: string[] = [];
      if (newFiles.length > 0) {
        setIsUploadingImages(true);
        try {
          uploadedFileUrls = await uploadImagesViaPresigned(newFiles);
        } finally {
          setIsUploadingImages(false);
        }
      }

      // 화면 순서 그대로 최종 imageUrls 구성 — 기존 URL 은 유지, 신규는
      // 업로드된 fileUrl 로 치환. 수정 시 전체 덮어쓰기라 유지분도 포함한다.
      let nextUploadedIndex = 0;
      const imageUrls = images.map((image) =>
        image.kind === 'existing'
          ? image.url
          : uploadedFileUrls[nextUploadedIndex++]
      );

      // 대표 썸네일: 선택 이미지의 최종 URL(imageUrls 와 index 정렬). 삭제돼
      // 못 찾으면 첫 장. imageUrls 가 비면 생략(undefined → JSON 에서 빠짐,
      // 서버가 null 처리). 비었는데 보내면 DIARY-009.
      const thumbnailImageIndex = images.findIndex(
        (image) => image.url === thumbnailImageUrl
      );
      const thumbnailUrl =
        imageUrls.length > 0
          ? imageUrls[thumbnailImageIndex >= 0 ? thumbnailImageIndex : 0]
          : undefined;

      if (isEditMode && requestedDiaryId) {
        await updateDiary.mutateAsync({
          id: requestedDiaryId,
          data: {
            challengeId: selectedChallenge.challengeId,
            title: trimmedTitle,
            content,
            feeling: selectedMood,
            isPublic: true,
            achievedDate: achievedDate ? formatDateISO(achievedDate) : '',
            achievedGoalIds,
            imageUrls,
            thumbnailUrl,
          },
        });

        router.push(`/diary/${requestedDiaryId}`);
        return;
      }

      await createDiary.mutateAsync({
        challengeId: selectedChallenge.challengeId,
        title: trimmedTitle,
        content,
        feeling: selectedMood,
        isPublic: true,
        achievedDate: achievedDate ? formatDateISO(achievedDate) : '',
        achievedGoalIds,
        imageUrls,
        thumbnailUrl,
      });

      router.push('/diary');
    } catch {
      submitSuccessRef.current = false;
      toast.error('일지 저장 또는 이미지 업로드에 실패했습니다.');
    }
  }, [
    achievedDate,
    achievedGoalIds,
    content,
    createDiary,
    disabledAchievedDateKeySet,
    images,
    isEditMode,
    isSubmitting,
    router,
    requestedDiaryId,
    selectedChallenge,
    selectedMood,
    thumbnailImageUrl,
    trimmedTitle,
    updateDiary,
  ]);

  const submitButtonLabel = getSubmitButtonLabel({
    isCreating: createDiary.isPending,
    isUpdating: updateDiary.isPending,
    isUploadingImage: isUploadingImages,
    isEditMode,
  });

  return {
    isEditMode,
    title,
    setTitle,
    content,
    setContent,
    selectedMood,
    setSelectedMood,
    achievedDate,
    setAchievedDate,
    selectedChallenge,
    memberChallenges: ongoingMemberChallenges,
    isMemberChallengesLoading,
    isInitialChallengeLoading,
    isCheckingChallengeAvailability,
    isSelectedChallengeConfirmed,
    goals,
    achievedGoalIds,
    disabledAchievedDateKeys,
    imagePreviewUrls,
    thumbnailIndex,
    submitButtonLabel,
    canSubmit,
    isSubmitting,
    isMissingChallengeDialogOpen,
    isCreateUnavailableDialogOpen,
    handleSelectChallenge,
    handleClearChallenge,
    handleGoalIdsChange,
    handleAchievedDateChange,
    isAchievedDateDisabled,
    handleAddImageFiles,
    handleRemoveImageAt,
    handleSelectThumbnailAt,
    closeMissingChallengeDialog,
    closeCreateUnavailableDialog,
    handleSubmit,
  };
}
