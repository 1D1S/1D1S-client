// app/challenge/create/components/Step1.tsx
import {
  ChallengeToggleGroup,
  ChallengeToggle,
} from '@/features/challenge/presentation/components/challenge-toggle';
import { ChallengeCreateFormValues } from '@/features/challenge/presentation/hooks/use-challenge-create-form';
import { OdosDatePicker } from '@/shared/components/odos-ui/date-picker';
import {
  OdosSelect,
  OdosSelectContent,
  OdosSelectItem,
  OdosSelectTrigger,
  OdosSelectValue,
} from '@/shared/components/odos-ui/dropdown';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosTextField } from '@/shared/components/odos-ui/text-field';
import { FormControl, FormField, FormItem, FormMessage } from '@/shared/components/ui/form';
import { useFormContext } from 'react-hook-form';

export function Step2(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();
  const periodType = watch('periodType');
  const period = watch('period');

  return (
    <div className="flex w-full flex-col items-start">
      <OdosSpacing className="h-25" />
      <OdosLabel size="display2" weight="bold">
        챌린지 기간을 입력해주세요.
      </OdosLabel>
      <OdosSpacing className="h-5" />

      <FormField
        control={control}
        name="periodType"
        render={({ field }) => (
          <FormItem>
            <ChallengeToggleGroup
              type="single"
              defaultValue="ENDLESS"
              value={field.value}
              onValueChange={field.onChange}
            >
              <ChallengeToggle
                value="ENDLESS"
                title="무한 기간"
                subtitle={
                  '종료일 없이 진행할 수 있는 챌린지입니다.\n루틴 형성이나 장기적인 습관 구축에 적합합니다'
                }
                isActive={field.value === 'ENDLESS'}
                activeImageSrc={'/images/endless-white.png'}
                inactiveImageSrc={'/images/endless-gray.png'}
                imageWidth={80}
                imageHeight={40}
              />
              <ChallengeToggle
                value="LIMITED"
                title="유한 기간"
                subtitle={
                  '정해진 기간 동안 진행되는 챌린지입니다.\n짧은 시간 안에 집중적으로 도전하고 싶은 사용자에게 적합합니다.'
                }
                isActive={field.value === 'LIMITED'}
                activeImageSrc={'/images/calendar-white.png'}
                inactiveImageSrc={'/images/calendar-gray.png'}
                imageWidth={70}
                imageHeight={60}
              />
            </ChallengeToggleGroup>
          </FormItem>
        )}
      />
      {periodType === 'LIMITED' && (
        <>
          <OdosSpacing className="h-20" />
          <OdosLabel size="heading1" weight="bold">
            기간 선택
          </OdosLabel>
          <OdosSpacing className="h-5" />
          <div className="flex gap-5">
            <FormField
              control={control}
              name="period"
              render={({ field }) => (
                <FormItem className="w-50">
                  <OdosSelect onValueChange={field.onChange}>
                    <FormControl className="w-50">
                      <OdosSelectTrigger className="w-50">
                        <OdosSelectValue placeholder="기간을 선택해주세요." />
                      </OdosSelectTrigger>
                    </FormControl>
                    <OdosSelectContent className="w-50">
                      <OdosSelectItem value="7">7일</OdosSelectItem>
                      <OdosSelectItem value="14">14일</OdosSelectItem>
                      <OdosSelectItem value="30">30일</OdosSelectItem>
                      <OdosSelectItem value="60">60일</OdosSelectItem>
                      <OdosSelectItem value="365">1년</OdosSelectItem>
                      <OdosSelectItem value="etc">직접 입력 (최대 2년)</OdosSelectItem>
                    </OdosSelectContent>
                  </OdosSelect>
                  <FormMessage />
                </FormItem>
              )}
            />

            {period === 'etc' && (
              <FormField
                control={control}
                name="periodNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <OdosTextField id="periodNumber" className="w-50" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <OdosSpacing className="h-10" />

          <FormItem>
            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <OdosDatePicker value={field.value} onChange={field.onChange} />
              )}
            />
            <FormMessage />
          </FormItem>
        </>
      )}
    </div>
  );
}
