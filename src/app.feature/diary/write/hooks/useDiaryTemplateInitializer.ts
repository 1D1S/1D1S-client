import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

/** 본문에 글자가 있는가. 빈 에디터는 `<p></p>` 같은 껍데기를 낸다. */
function hasText(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
}

interface UseDiaryTemplateInitializerParams {
  /** 수정 모드에는 주입하지 않는다 — 쓰던 글을 양식이 덮어쓴다. */
  isEditMode: boolean;
  /** 선택된 챌린지의 일지 양식(HTML). 없으면 undefined/null. */
  template?: string | null;
  /** 챌린지를 바꾸면 다시 주입할 수 있게 기준이 된다. */
  challengeId?: number | null;
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
}

interface UseDiaryTemplateInitializerResult {
  /** 본문이 주입된 양식 그대로일 때만 true — 제거 버튼 활성 조건. */
  canRemoveTemplate: boolean;
  removeTemplate(): void;
}

/**
 * 새 일지에 챌린지 일지 양식을 채워 넣는다.
 *
 * 덮어쓰지 않는 것이 핵심이다. 이미 쓴 글이 있으면 건드리지 않고,
 * 챌린지당 한 번만 주입한다 — 양식을 지우고 쓰기 시작했는데 쿼리가
 * 다시 도착했다고 되살아나면 쓰던 글을 잃는다.
 */
export function useDiaryTemplateInitializer({
  isEditMode,
  template,
  challengeId,
  content,
  setContent,
}: UseDiaryTemplateInitializerParams): UseDiaryTemplateInitializerResult {
  // 주입한 원문. 본문이 이것과 글자 하나까지 같을 때만 "손대지 않은
  // 양식" 이다. 사용자가 한 글자라도 고치면 에디터가 정규화한 HTML 을
  // 내보내 값이 갈라지므로, 그 시점부터 제거 버튼이 꺼진다.
  const [injected, setInjected] = useState<string | null>(null);
  const filledForChallengeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isEditMode || !challengeId || !template || !hasText(template)) {
      return;
    }
    if (filledForChallengeRef.current === challengeId) {
      return;
    }
    filledForChallengeRef.current = challengeId;
    if (hasText(content)) {
      return;
    }
    setContent(template);
    setInjected(template);
    // content 는 "지금 비어 있나" 를 보는 값이라 의존성에 넣지 않는다.
    // 넣으면 사용자가 타이핑할 때마다 이 effect 가 다시 돈다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId, isEditMode, setContent, template]);

  const removeTemplate = useCallback(() => {
    setContent('');
    setInjected(null);
  }, [setContent]);

  return {
    canRemoveTemplate: injected !== null && content === injected,
    removeTemplate,
  };
}
