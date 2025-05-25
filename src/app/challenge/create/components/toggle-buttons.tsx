import { OdosLabel } from '@/shared/components/odos-ui/label';
import { cn } from '@/shared/lib/utils';

interface ToggleButtonProps {
  title: string;
  subtitle: string;
  isActive: boolean;
  icon: React.ReactNode;
  onClick?(): void;
}

export default function ToggleButton({
  title,
  subtitle,
  isActive,
  icon,
  onClick,
}: ToggleButtonProps): React.ReactElement {
  return (
    <div
      className={cn(
        isActive ? 'bg-main-900' : 'bg-gray-300',
        'flex flex-col',
        'rounded-odos-2 h-52 p-4',
        'transition-colors',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <OdosLabel
        size={'heading2'}
        weight={'bold'}
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
        size={'body2'}
        weight={'medium'}
        className={cn(
          isActive ? 'text-white' : 'text-gray-500',
          'mb-2 gap-2',
          'flex items-center',
          'transition-colors'
        )}
      >
        {subtitle}
      </OdosLabel>
      <div
        className={cn(
          'mt-auto ml-auto',
          'w-fit',
          isActive ? 'bg-white' : 'bg-gray-500',
          'transition-colors'
        )}
      >
        {icon}
      </div>
    </div>
  );
}
