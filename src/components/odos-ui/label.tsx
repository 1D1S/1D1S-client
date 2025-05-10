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

/**
 * OdosLabel
 * 텍스트에 사이즈 및 굵기를 적용하는 커스텀 라벨 컴포넌트
 *
 * @param size 텍스트 크기 : heading1, heading2, body1, body2, caption1, caption2, caption3, pageTitle
 * @default size body2
 * @param weight 텍스트 굵기 : bold, medium, regular, light
 * @param as HTML 태그 또는 커스텀 컴포넌트로 렌더링 (기본값: span)
 *
 * @example 기본 사용
 * ```tsx
 * <OdosLabel size="body1" weight="bold">텍스트</OdosLabel>
 * ```
 *
 * @example HTML 태그 변경
 * ```tsx
 * <OdosLabel as="p" size="caption1" weight="regular">단락 텍스트</OdosLabel>
 * ```
 */
export function OdosLabel({
  className,
  size,
  weight,
  as: Tag = 'span',
  ...props
}: { as?: React.ElementType } & React.ComponentPropsWithoutRef<'span'> &
  VariantProps<typeof odosLabelVariants>): React.ReactElement {
  return <Tag className={cn(odosLabelVariants({ size, weight, className }))} {...props} />;
}
