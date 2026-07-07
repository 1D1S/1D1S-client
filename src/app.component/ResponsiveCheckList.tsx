import { CheckList } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

/**
 * 목표 리스트(CheckList)를 뷰포트별로 다른 size 로 렌더한다.
 *
 * DS `CheckList` 의 `size`(sm·md·lg)는 단일 값이라 반응형으로 직접
 * 줄 수 없다. 모바일(<lg)은 `sm`, 데스크톱은 `md` 두 인스턴스를 뷰포트별로
 * 토글한다. CheckList 는 내부에서 `useId` 로 항목
 * id 를 분리하므로 중복 렌더해도 라벨/input id 가 충돌하지 않는다(인터랙티브
 * 사용에도 안전). 숨겨진 인스턴스는 `display:none` 이라 포커스 대상에서도 빠진다.
 */
type ResponsiveCheckListProps = Omit<
  React.ComponentProps<typeof CheckList>,
  'size'
>;

export function ResponsiveCheckList({
  className,
  ...props
}: ResponsiveCheckListProps): React.ReactElement {
  return (
    <>
      <CheckList {...props} size="sm" className={cn(className, 'lg:hidden')} />
      {/* CheckList 컨테이너는 flex column — lg:block 이면 gap 이 무시된다 */}
      <CheckList
        {...props}
        size="md"
        className={cn(className, 'hidden lg:flex')}
      />
    </>
  );
}
