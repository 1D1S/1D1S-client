import { cn } from '@/presentation/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { OdosLabel } from './label';

const allButtonVariants = 'h-auto px-6 border-none shadow-none px-6';
const largeButtonVariants = 'rounded-odos-2 py-4';
const smallButtonVariants = 'rounded-odos-1 py-1.5';

const odosButtonVariants = cva('', {
  variants: {
    variant: {
      default: cn(
        buttonVariants({ variant: 'default', size: 'default' }),
        allButtonVariants,
        largeButtonVariants,
        'bg-main-900 text-white hover:bg-main-800'
      ),
      disabled: cn(
        buttonVariants({ variant: 'default', size: 'default' }),
        allButtonVariants,
        largeButtonVariants,
        'bg-gray-400 text-gray-600 hover:bg-gray-400'
      ),
      warning: cn(
        buttonVariants({ variant: 'destructive', size: 'default' }),
        allButtonVariants,
        largeButtonVariants,
        'bg-warning text-white'
      ),
      loading: cn(
        buttonVariants({ variant: 'default', size: 'default' }),
        allButtonVariants,
        largeButtonVariants,
        'bg-main-900 hover:bg-main-900'
      ),
      outline: cn(
        buttonVariants({ variant: 'outline', size: 'default' }),
        allButtonVariants,
        largeButtonVariants,
        'text-gray-900 hover:bg-main-900 hover:text-white inset-ring-[1.5px] inset-ring-main-900'
      ),
      defaultSmall: cn(
        buttonVariants({ variant: 'default', size: 'sm' }),
        allButtonVariants,
        smallButtonVariants,
        'bg-main-900 text-white hover:bg-main-800'
      ),
      disabledSmall: cn(
        buttonVariants({ variant: 'default', size: 'sm' }),
        allButtonVariants,
        smallButtonVariants,
        'bg-gray-400 text-gray-600 hover:bg-gray-400'
      ),
      warningSmall: cn(
        buttonVariants({ variant: 'destructive', size: 'sm' }),
        allButtonVariants,
        smallButtonVariants,
        'bg-warning text-white'
      ),
      loadingSmall: cn(
        buttonVariants({ variant: 'default', size: 'sm' }),
        allButtonVariants,
        smallButtonVariants,
        'bg-main-900 hover:bg-main-900'
      ),
      outlineSmall: cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        allButtonVariants,
        smallButtonVariants,
        'text-gray-900 hover:bg-main-900 hover:text-white inset-ring-[1px] inset-ring-main-900'
      ),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/**
 * OdosButton
 * 커스텀 버튼 컴포넌트
 * @param variant 버튼스타일 :default, disabled, warning, loading, outline, defaultSmall, disabledSmall, warningSmall, loadingSmall, outlineSmall
 *
 * @example 기본 버튼
 * ```tsx
 * <OdosButton variant="default">Default OdosButton</OdosButton>
 * ```
 */
export function OdosButton({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof odosButtonVariants> & {
    asChild?: boolean;
  }): React.ReactElement {
  const Comp = asChild ? Slot : 'button';
  const isSmall = variant?.includes('Small');
  const isDisabled = variant?.includes('disalbed');
  return (
    <Comp data-slot="button" className={cn(odosButtonVariants({ variant, className }))} {...props}>
      <OdosLabel size={isSmall ? 'caption3' : 'body1'} weight={isDisabled ? 'regular' : 'bold'}>
        {props.children}
      </OdosLabel>
    </Comp>
  );
}
