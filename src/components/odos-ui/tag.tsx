import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { OdosLabel } from './label';

const tagVariants = cva(
  'inline-flex items-center rounded-odos-1 px-1.5 py-1 bg-main-900 text-white',
  {
    variants: {
      hasIcon: {
        true: 'gap-1',
        false: '',
      },
    },
    defaultVariants: {
      hasIcon: false,
    },
  }
);

type TagProps = {
  icon?: string;
  children: React.ReactNode;
  className?: string;
  weight?: 'bold' | 'medium' | 'regular' | 'light';
} & VariantProps<typeof tagVariants>;

export function OdosTag({
  icon,
  children,
  weight = 'bold',
  className,
}: TagProps): React.ReactElement {
  return (
    <span className={cn(tagVariants({ hasIcon: Boolean(icon) }), className)}>
      {icon && (
        <OdosLabel size="caption3" weight="medium">
          {icon}
        </OdosLabel>
      )}
      <OdosLabel size="caption3" weight={weight}>
        {children}
      </OdosLabel>
    </span>
  );
}
