import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import type { ReactNode } from 'react';

interface ChallengeCreateSectionCardProps {
  step: number;
  title: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChallengeCreateSectionCard({
  step,
  title,
  hint,
  children,
  className,
}: ChallengeCreateSectionCardProps): React.ReactElement {
  return (
    <section
      className={cn(
        'rounded-3 border border-gray-200 bg-white px-5 py-6 md:px-6 md:py-7',
        className
      )}
    >
      <div className="mb-5 flex items-baseline gap-2.5">
        <span
          className={cn(
            'bg-main-200 text-main-800 inline-flex h-[22px] w-[22px]',
            'items-center justify-center rounded-full text-[11px] font-extrabold'
          )}
        >
          {step}
        </span>
        <Text
          size="body1"
          weight="bold"
          className="-tracking-[0.3px] text-gray-900"
        >
          {title}
        </Text>
        {hint ? (
          <span className="ml-auto text-[11px] text-gray-500">{hint}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
