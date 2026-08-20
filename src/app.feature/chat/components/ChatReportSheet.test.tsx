import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChatReportSheet } from './ChatReportSheet';

function submitButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: '신고하기' }) as HTMLButtonElement;
}

// jest-dom 매처를 쓰지 않는 저장소라 disabled 는 속성으로 직접 본다.
function renderSheet(onSubmit = vi.fn()): ReturnType<typeof vi.fn> {
  render(
    <ChatReportSheet
      messageId={42}
      isPending={false}
      onOpenChange={vi.fn()}
      onSubmit={onSubmit}
    />
  );
  return onSubmit;
}

describe('ChatReportSheet', () => {
  it('사유를 고르기 전에는 접수할 수 없다', () => {
    renderSheet();
    expect(submitButton().disabled).toBe(true);
  });

  it('사유만 고르면 상세 없이 접수된다', () => {
    const onSubmit = renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /스팸/ }));
    fireEvent.click(submitButton());
    expect(onSubmit).toHaveBeenCalledWith(42, {
      reason: 'SPAM',
      detail: undefined,
    });
  });

  it('"기타" 는 상세가 있어야 접수된다 — 그것만으로는 판단 근거가 없다', () => {
    const onSubmit = renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /기타/ }));
    expect(submitButton().disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText(/상세히/), {
      target: { value: '  광고 도배  ' },
    });
    fireEvent.click(submitButton());
    // 공백은 다듬어 보낸다.
    expect(onSubmit).toHaveBeenCalledWith(42, {
      reason: 'OTHER',
      detail: '광고 도배',
    });
  });
});
