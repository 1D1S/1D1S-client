'use client';

import { Toggle } from '@/shared/components/ui/toggle';
import { OdosLabel } from './label';
import { cn } from '@/shared/lib/utils';

interface ToggleProps {
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * OdosToggle
 * 간단한 토글 스타일을 위한 컴포넌트 (텍스트 + 아이콘 구성)
 *
 * @param icon 선택적 아이콘 이모지 텍스트
 *
 * @example 기본 사용
 * ```tsx
 * <OdosToggle icon="🔥">인기</OdosToggle>
 * ```
 */
export function OdosToggle({ icon, children, className }: ToggleProps): React.ReactElement {
  const hasIcon = Boolean(icon);
  return (
    <Toggle
      className={cn(
        'data-[state=on]:bg-main-900 bg-gray-200 px-3 py-2 font-light text-gray-700 data-[state=on]:font-bold data-[state=on]:text-white',
        hasIcon && 'gap-2.5',
        className
      )}
    >
      {icon && (
        <OdosLabel size="body2" weight="regular">
          {icon}
        </OdosLabel>
      )}
      <OdosLabel size="body2" weight={null}>
        {children}
      </OdosLabel>
    </Toggle>
  );
}
