import { cn } from '@/lib/utils';
import { OdosLabel } from './label';
import Image from 'next/image';
import { cva, VariantProps } from 'class-variance-authority';

const pageTitleVariants = cva('flex flex-col items-center', {
  variants: {
    variant: {
      withSubtitle: 'pb-2 pt-6 gap-2',
      noSubtitle: 'py-5',
    },
  },
  defaultVariants: {
    variant: 'noSubtitle',
  },
});

type PageTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
} & VariantProps<typeof pageTitleVariants>;

export function OdosPageTitle({
  title,
  subtitle,
  variant = 'noSubtitle',
  className,
}: PageTitleProps): React.ReactElement {
  return (
    <div className={cn('flex items-end gap-6', className)}>
      <Image src="/images/logo.png" alt="로고" width={48} height={80} />
      <div className={pageTitleVariants({ variant })}>
        <OdosLabel size="pageTitle" weight="bold" className="text-black">
          {title}
        </OdosLabel>
        {variant === 'withSubtitle' && subtitle && (
          <OdosLabel size="caption1" weight="medium" className="text-black">
            {subtitle}
          </OdosLabel>
        )}
      </div>
    </div>
  );
}
