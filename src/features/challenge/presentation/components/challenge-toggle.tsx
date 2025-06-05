import Image from 'next/image';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { cn } from '@/shared/lib/utils';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

interface ToggleButtonProps {
  title: string;
  subtitle: string;
  isActive: boolean;
  activeImageSrc: string;
  inactiveImageSrc: string;
  imageWidth: number;
  imageHeight: number;
}

export function ChallengeToggle({
  title,
  subtitle,
  isActive,
  activeImageSrc,
  inactiveImageSrc,
  imageWidth,
  imageHeight,
  ...props
}: ToggleButtonProps & React.ComponentProps<typeof ToggleGroupPrimitive.Item>): React.ReactElement {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        'data-[state=on]:bg-main-900 bg-gray-300',
        'text-gray-500 data-[state=on]:text-white',
        'flex flex-col',
        'rounded-odos-2 h-52 p-5',
        'transition-colors',
        'cursor-pointer'
      )}
      {...props}
    >
      <OdosLabel
        size="heading2"
        weight="bold"
        className={cn('mb-2 gap-2', 'flex items-center', 'transition-colors')}
      >
        {title}
      </OdosLabel>
      <OdosLabel
        size="body2"
        weight="medium"
        className={cn('mb-2 gap-2', 'flex items-start', 'transition-colors')}
      >
        {subtitle}
      </OdosLabel>
      <Image
        className={cn('mt-auto ml-auto', 'flex items-end justify-end')}
        width={imageWidth}
        height={imageHeight}
        src={isActive ? activeImageSrc : inactiveImageSrc}
        alt={`${title} icon`}
      />
    </ToggleGroupPrimitive.Item>
  );
}

export function ChallengeToggleGroup({
  children,
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>): React.ReactElement {
  return (
    <ToggleGroupPrimitive.Root
      className={cn('flex flex-wrap gap-x-7.5 gap-y-2.5 rounded-none', className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  );
}
