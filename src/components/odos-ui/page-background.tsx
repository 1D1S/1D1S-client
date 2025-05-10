import { cn } from '@/lib/utils';

/**
 * OdosPageBackground
 * 페이지 또는 카드의 기본 배경 영역을 구성하는 컨테이너 컴포넌트
 *
 * @example
 * ```tsx
 * <OdosPageBackground className="min-w-250">
 *   <SomeSection />
 * </OdosPageBackground>
 * ```
 */
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
