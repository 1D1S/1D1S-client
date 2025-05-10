/**
 * OdosSpacing
 * 레이아웃 내 간격을 위해 사용되는 유틸리티 컴포넌트
 *
 * @param className Tailwind 유틸리티 클래스로 간격 크기 지정
 *
 * @example 기본 사용
 * ```tsx
 * <OdosSpacing className="h-4" />
 * ```
 */
export function OdosSpacing({
  className,
}: React.ComponentPropsWithoutRef<'div'>): React.ReactElement {
  return <div className={className} />;
}
