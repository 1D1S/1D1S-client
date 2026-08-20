'use client';

import { Text } from '@1d1s/design-system';
import { DiaryContentRenderer } from '@feature/diary/shared/components/DiaryContentRenderer';
import { cn } from '@module/utils/cn';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

/**
 * 호스트가 정해 둔 일지 양식 미리보기.
 *
 * 기본은 접힘이다. 양식은 길 수 있어 펼친 채 두면 개요의 목표·정보
 * 카드가 화면 밖으로 밀린다.
 *
 * 서버가 저장 시 허용목록으로 새니타이즈하지만, 렌더는
 * DiaryContentRenderer 를 거친다 — 저장 이후에 들어온 값이나 캐시된
 * 옛 값까지 신뢰하지 않기 위해 DOMPurify 를 한 번 더 태운다.
 */
export function ChallengeDiaryTemplateCard({
  template,
}: {
  template: string;
}): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <section
      className={cn(
        'rounded-[14px] border border-gray-200 bg-white',
        'p-4 sm:p-5 lg:p-6'
      )}
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <Text
          as="h2"
          size="heading2"
          weight="extrabold"
          className="tracking-[-0.3px] text-gray-900"
        >
          일지 양식
        </Text>
        <Chevron className="h-4 w-4 shrink-0 text-gray-500" />
      </button>

      {expanded ? (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <DiaryContentRenderer html={template} />
        </div>
      ) : (
        <Text size="body2" className="mt-1 block text-gray-500">
          이 챌린지는 일지 양식이 있어요. 새 일지를 쓰면 본문에 채워집니다.
        </Text>
      )}
    </section>
  );
}
