import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DiaryCreatedDialog } from './DiaryCreatedDialog';

type Props = Parameters<typeof DiaryCreatedDialog>[0];

function open(props: Partial<Props> = {}): ReturnType<typeof render> {
  return render(
    <DiaryCreatedDialog
      open
      streakIncreased={false}
      streakDays={0}
      canViewDiary
      onViewDiary={vi.fn()}
      onBack={vi.fn()}
      {...props}
    />
  );
}

describe('DiaryCreatedDialog — 앱 showDiaryCreatedModal 과 같은 분기', () => {
  it('스트릭이 안 오르면 담백한 완료', () => {
    open();
    expect(screen.getByText('일지 작성 완료')).toBeDefined();
    expect(screen.getByText('오늘의 기록을 저장했어요.')).toBeDefined();
  });

  it('스트릭이 오르면 축하 문구', () => {
    open({ streakIncreased: true, streakDays: 5 });
    expect(screen.getByText('5')).toBeDefined();
    expect(
      screen.getByText('오늘도 기록을 이어갔어요. 내일도 만나요!')
    ).toBeDefined();
  });

  it('일수를 모르면 축하로 가지 않는다 — 틀린 숫자를 띄우느니', () => {
    open({ streakIncreased: true, streakDays: 0 });
    expect(screen.getByText('일지 작성 완료')).toBeDefined();
  });

  it('볼 수 없는 일지면 돌아가기만 남는다', () => {
    open({ canViewDiary: false });
    expect(screen.queryByText('일지 보기')).toBeNull();
    expect(screen.getByText('돌아가기')).toBeDefined();
  });

  // 상용에서 모달이 화면 맨 아래에 떴던 회귀. className 에 position
  // 유틸을 얹으면 tailwind-merge 가 DialogContent 의 `fixed` 를 지운다.
  it('카드는 fixed 로 화면 중앙에 선다', () => {
    open();
    const card = screen.getByRole('dialog');
    expect(card.className).toContain('fixed');
    expect(card.className.split(/\s+/)).not.toContain('relative');
  });

  it('바깥을 눌러 닫으면 돌아가기와 같게 다룬다', () => {
    const onBack = vi.fn();
    open({ onBack });
    screen.getByText('돌아가기').click();
    expect(onBack).toHaveBeenCalled();
  });
});
