import { cn } from '@/lib/utils';

export function OdosPageBackground({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'shadow-odos-default flex h-full min-w-200 flex-col items-center bg-white',
        className
      )}
    >
      {children}
    </div>
  );
}
