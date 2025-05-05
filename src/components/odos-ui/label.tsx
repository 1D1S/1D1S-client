import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const odosLabelVariants = cva('', {
  variants: {
    size: {
      heading1: 'text-3xl',
      heading2: 'text-2xl',
      body1: 'text-xl',
      body2: 'text-lg',
      caption1: 'text-base',
      caption2: 'text-sm',
      caption3: 'text-xs',
      pageTitle: 'text-3xl',
    },
    weight: {
      bold: 'font-bold',
      medium: 'font-medium',
      regular: 'font-regular',
      light: 'font-light',
    },
  },
  defaultVariants: {
    size: 'body2',
    weight: 'medium',
  },
});

export function OdosLabel({
  className,
  size,
  weight,
  ...props
}: React.ComponentProps<'p'> & VariantProps<typeof odosLabelVariants>): React.ReactElement {
  return <p className={cn(odosLabelVariants({ size, weight, className }))} {...props} />;
}
