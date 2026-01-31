import Image from 'next/image';
import { Text } from '@1d1s/design-system';
import { cn } from '@module/lib/utils';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

interface ToggleButtonProps {
  title: string;
  subtitle: string;
  isActive: boolean;
  activeImageSrc: string;
  inactiveImageSrc: string;
  imageWidth: number;
  imageHeight: number;
}

/**
 * ChallengeToggle
 * 챌린지 타입 선택 시 사용되는 토글 컴포넌트
 *
 * @param title 토글에 표시될 제목 텍스트
 * @param subtitle 부제목 텍스트 (줄바꿈은 '\n'으로 가능)
 * @param isActive 현재 선택 상태 여부
 * @param activeImageSrc 활성화 상태일 때 이미지 경로
 * @param inactiveImageSrc 비활성화 상태일 때 이미지 경로
 * @param imageWidth 이미지 너비
 * @param imageHeight 이미지 높이
 *
 * @example
 * <ChallengeToggle
 *   value="ENDLESS"
 *   title="무한 기간"
 *   subtitle={ '종료일 없이 진행할 수 있는 챌린지입니다.\n루틴 형성이나 장기적인 습관 구축에 적합합니다'}
 *   isActive={true}
 *   activeImageSrc="/images/endless-white.png"
 *   inactiveImageSrc="/images/endless-gray.png"
 *   imageWidth={80}
 *   imageHeight={40}
 * />
 */
export function ChallengeToggle({
  title,
  subtitle,
  isActive,
  activeImageSrc,
  inactiveImageSrc,
  imageWidth,
  imageHeight,
  ...props
}: ToggleButtonProps & React.ComponentProps<typeof ToggleGroupPrimitive.Item>): React.ReactElement {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        'data-[state=on]:bg-main-900 bg-gray-300',
        'text-gray-500 data-[state=on]:text-white',
        'flex flex-col items-start justify-between text-left',
        'rounded-odos-2 h-52 w-115 p-5',
        'transition-colors',
        'cursor-pointer'
      )}
      {...props}
    >
      <div className="flex flex-col items-start">
        <Text size="heading2" weight="bold" className="mb-2 block transition-colors">
          {title}
        </Text>
        <Text
          size="body2"
          weight="medium"
          className={cn('block text-left', 'transition-colors', 'whitespace-pre-line')}
        >
          {subtitle}
        </Text>
      </div>
      <Image
        className={cn('mt-auto ml-auto', 'flex items-end justify-end')}
        width={imageWidth}
        height={imageHeight}
        src={isActive ? activeImageSrc : inactiveImageSrc}
        alt={`${title} icon`}
      />
    </ToggleGroupPrimitive.Item>
  );
}

/**
 * ChallengeToggleGroup
 * ChallengeToggle 컴포넌트들을 그룹으로 묶는 컴포넌트
 * 단일 선택 또는 다중 선택용으로 사용할 수 있음
 *
 * @param children ChallengeToggle 컴포넌트들
 * @param className 추가 커스텀 클래스
 *
 * @example
 * <ChallengeToggleGroup type="single" value="ENDLESS" onValueChange={setValue}>
 *   <ChallengeToggle ... />
 *   <ChallengeToggle ... />
 * </ChallengeToggleGroup>
 */
export function ChallengeToggleGroup({
  children,
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>): React.ReactElement {
  return (
    <ToggleGroupPrimitive.Root
      className={cn('flex flex-wrap gap-x-7.5 gap-y-2.5 rounded-none', className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  );
}
