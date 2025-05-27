import Image from 'next/image';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { cn } from '@/shared/lib/utils';

interface ToggleButtonProps {
  title: string;
  subtitle: string;
  isActive: boolean;
  activeImageSrc: string;
  inactiveImageSrc: string; // Optional prop for inactive state image
  imageWidth: number;
  imageHeight: number;
  onClick?(): void;
}

export default function ToggleButton({
  title,
  subtitle,
  isActive,
  activeImageSrc,
  inactiveImageSrc,
  imageWidth,
  imageHeight,
  onClick,
}: ToggleButtonProps): React.ReactElement {
  return (
    <div
      className={cn(
        isActive ? 'bg-main-900' : 'bg-gray-300',
        'flex flex-col',
        'rounded-odos-2 h-52 p-5',
        'transition-colors',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <OdosLabel
        size="heading2"
        weight="bold"
        className={cn(
          isActive ? 'text-white' : 'text-gray-500',
          'mb-2 gap-2',
          'flex items-center',
          'transition-colors'
        )}
      >
        {title}
      </OdosLabel>
      <OdosLabel
        size="body2"
        weight="medium"
        className={cn(
          isActive ? 'text-white' : 'text-gray-500',
          'mb-2 gap-2',
          'flex items-center',
          'transition-colors'
        )}
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
    </div>
  );
}
