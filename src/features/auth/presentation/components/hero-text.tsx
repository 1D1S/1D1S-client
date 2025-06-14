import { cn } from '@/shared/lib/utils';

export function HeroText({
  className,
  children,
  ...props
}: React.ComponentProps<'span'>): React.ReactElement {
  return (
    <span className={cn('text-[40px] font-bold tracking-tight', className)} {...props}>
      {children}
    </span>
  );
}
