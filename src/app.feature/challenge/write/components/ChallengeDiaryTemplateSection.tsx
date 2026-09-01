'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import dynamic from 'next/dynamic';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { DIARY_TEMPLATE_MAX_LENGTH } from '../../board/type/challenge';
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';

// tiptap 은 무겁다. 일지 작성 화면과 같은 이유로 동적 import 한다.
const DiaryContentEditor = dynamic(
  () =>
    import('@feature/diary/write/components/DiaryContentEditor').then(
      (mod) => mod.DiaryContentEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className={cn(
          'rounded-3 min-h-[220px] w-full animate-pulse border',
          'border-gray-200 bg-gray-50'
        )}
        aria-hidden
      />
    ),
  }
);

/**
 * 호스트가 정하는 일지 양식. 생성·수정 화면이 같이 쓴다.
 *
 * 두 폼의 스키마는 갈라져 있지만 이 필드만은 이름·타입이 같아서 하나로
 * 둘 수 있다. 섹션을 두 벌로 복사하면 다음 문구 수정이 한쪽에만 반영된다.
 */
export function ChallengeDiaryTemplateSection({
  step,
}: {
  step: number;
}): React.ReactElement {
  const { watch, setValue } = useFormContext<{ diaryTemplate?: string }>();
  const value = watch('diaryTemplate') ?? '';
  const tooLong = value.length > DIARY_TEMPLATE_MAX_LENGTH;

  return (
    <ChallengeCreateSectionCard step={step} title="일지 양식" hint="선택">
      <Text size="caption2" className="mb-3 block text-gray-500">
        참여자가 새 일지를 쓸 때 본문에 기본으로 채워집니다. 비워 두면 양식 없이
        시작합니다.
      </Text>
      <DiaryContentEditor
        variant="template"
        content={value}
        onChange={(html) =>
          setValue('diaryTemplate', html, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />
      {tooLong ? (
        <Text size="caption3" className="mt-2 block text-red-500">
          일지 양식이 너무 깁니다. {DIARY_TEMPLATE_MAX_LENGTH}자 이하로
          줄여주세요.
        </Text>
      ) : null}
    </ChallengeCreateSectionCard>
  );
}
