import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Slot } from '@radix-ui/react-slot';
import { X } from 'lucide-react';

/**
 * ChallengeGoalCreateButton
 * 챌린지 목표 생성 버튼 컴포넌트
 *
 * @example 기본 버튼
 * ```tsx
 * <ChallengeGoalCreateButton>+ 목표 생성</ChallengeGoalCreateButton>
 * ```
 */
export function ChallengeGoalCreateButton({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
}): React.ReactElement {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn('rounded-odos-2 bg-gray-200 px-2 py-1', className)}
      {...props}
    >
      <Text size="caption1" weight="medium" className="text-gray-600">
        {props.children}
      </Text>
    </Comp>
  );
}

/**
 * ChallengeGoalDeleteButton
 * 챌린지 목표 삭제 버튼 컴포넌트
 *
 * @example 기본 버튼
 * ```tsx
 * <ChallengeGoalDeleteButton onClick={} />
 * ```
 */
export function ChallengeGoalDeleteButton({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
}): React.ReactElement {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(
        'rounded-odos-2 hover:bg-main-900 bg-white text-gray-900 hover:text-white',
        'p-2',
        'flex items-center justify-center',
        className
      )}
      {...props}
    >
      <X scale="24" />
    </Comp>
  );
}
