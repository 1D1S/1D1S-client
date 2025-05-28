'use client';

import { Toggle } from '@/shared/components/ui/toggle';
import { OdosLabel } from './label';
import { cn } from '@/shared/lib/utils';

interface ToggleProps {
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

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
