'use client';

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { OdosLabel } from './label';
import { cn } from '@/shared/lib/utils';

interface ToggleProps extends React.ComponentProps<typeof ToggleGroupPrimitive.Item> {
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * OdosToggleGroup
 * 토글 그룹 컴포넌트
 *
 * @example 기본 사용
 * ```tsx
 * <OdosToggleGroup type="single">
 *  <OdosToggleGroupItem icon="🔥">인기</OdosToggleGroupItem
 *  <OdosToggleGroupItem icon="⭐">추천</OdosToggleGroupItem>
 *  <OdosToggleGroupItem icon="💬">토론</OdosToggleGroupItem
 * </OdosToggleGroup>
 * ```
 */
export function OdosToggleGroup({
  children,
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>): React.ReactElement {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('flex flex-wrap gap-x-2.5 gap-y-2.5 rounded-none', className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  );
}

/**
 * OdosToggleGroupItem
 * 간단한 토글 스타일을 위한 컴포넌트 (텍스트 + 아이콘 구성)
 *
 * @param icon 선택적 아이콘 이모지 텍스트
 *
 * @example 기본 사용
 * ```tsx
 * <OdosToggleGroupItem icon="🔥">인기</OdosToggle>
 * ```
 */
export function OdosToggleGroupItem({
  icon,
  children,
  className,
  ...props
}: ToggleProps): React.ReactElement {
  const hasIcon = Boolean(icon);
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "hover:bg-muted hover:text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'data-[state=on]:bg-main-900 bg-gray-200 px-3 py-2 font-light text-gray-700 data-[state=on]:font-bold data-[state=on]:text-white',
        hasIcon && 'gap-2.5',
        className
      )}
      {...props}
    >
      {icon && (
        <OdosLabel size="body2" weight="regular">
          {icon}
        </OdosLabel>
      )}
      <OdosLabel size="body2" weight={null}>
        {children}
      </OdosLabel>
    </ToggleGroupPrimitive.Item>
  );
}
