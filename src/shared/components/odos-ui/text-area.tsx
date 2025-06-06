'use client';

import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';
import { OdosLabel, odosLabelVariants } from './label';

interface TextAreaProps extends React.ComponentProps<typeof Textarea> {
  label?: string;
  error?: string;
}

/**
 * OdosTextArea
 * 입력 필드 컴포넌트
 *
 * @param label 입력 필드 레이블 (선택적)
 * @param error 입력 필드 오류 메시지 (선택적)
 *
 * @example 기본 사용
 * ```tsx
 * <OdosTextArea
 *   label="에러 메시지가 있는 텍스트 필드"
 *   placeholder="텍스트 필드"
 *   error="이 필드는 필수입니다."
 * />
 * ```
 */
export function OdosTextArea({
  className,
  label,
  error,
  ...props
}: TextAreaProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-black" htmlFor={props.id ? props.id : undefined}>
          <OdosLabel size="body2" weight="bold">
            {label}
          </OdosLabel>
        </label>
      )}
      <Textarea
        className={cn(
          odosLabelVariants({ size: 'body2', weight: 'regular' }),
          'rounded-odos-2 h-auto w-auto border-none bg-gray-50 px-3 py-3 text-gray-900 shadow-none placeholder:text-gray-500',
          'focus-visible:inset-ring-main-700 focus-visible:bg-main-100 focus-visible:border-0 focus-visible:ring-0 focus-visible:inset-ring-[1.5px] focus-visible:outline-none',
          className
        )}
        {...props}
      />
      {error && (
        <OdosLabel size="caption2" weight="regular" className="text-warning">
          {error}
        </OdosLabel>
      )}
    </div>
  );
}
