// app/challenge/create/components/Step1.tsx
import {
  ChallengeToggleGroup,
  ChallengeToggle,
} from '@/features/challenge/presentation/components/challenge-toggle';
import { ChallengeCreateFormValues } from '@/features/challenge/presentation/hooks/use-challenge-create-form';
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

export function Step3(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();
  const participationType = watch('participationType');
  const memberCount = watch('memberCount');

  return (
    <div>
      <OdosSpacing className="h-25" />
      <OdosLabel size="display2" weight="bold">
        챌린지 인원을 입력을주세요.
      </OdosLabel>
      <OdosSpacing className="h-5" />

      <FormField
        control={control}
        name="participationType"
        render={({ field }) => (
          <FormItem>
            <ChallengeToggleGroup
              type="single"
              defaultValue=""
              value={field.value}
              onValueChange={field.onChange}
            >
              <ChallengeToggle
                value="INDIVIDUAL"
                title="개인 챌린지"
                subtitle={'혼자서 진행하는 챌린지입니다.\n(챌린지 목록에서 조회되지 않습니다.)'}
                isActive={field.value === 'INDIVIDUAL'}
                activeImageSrc={'/images/endless-white.png'}
                inactiveImageSrc={'/images/endless-gray.png'}
                imageWidth={80}
                imageHeight={40}
              />
              <ChallengeToggle
                value="GROUP"
                title="단체 챌린지"
                subtitle={'친구들과, 혹은 같은 목표를 가진 다른 사람들과\n진행하는 챌린지입니다.'}
                isActive={field.value === 'GROUP'}
                activeImageSrc={'/images/calendar-white.png'}
                inactiveImageSrc={'/images/calendar-gray.png'}
                imageWidth={70}
                imageHeight={60}
              />
            </ChallengeToggleGroup>
          </FormItem>
        )}
      />

      {participationType === 'GROUP' && (
        <>
          <OdosSpacing className="h-12" />
          <OdosLabel size="heading1" weight="bold">
            인원 선택
          </OdosLabel>
          <OdosSpacing className="h-5" />
          <div className="flex gap-5">
            <FormField
              control={control}
              name="memberCount"
              render={({ field }) => (
                <FormItem className="w-50">
                  <OdosSelect onValueChange={field.onChange}>
                    <FormControl className="w-50">
                      <OdosSelectTrigger className="w-50">
                        <OdosSelectValue placeholder="기간을 선택해주세요." />
                      </OdosSelectTrigger>
                    </FormControl>
                    <OdosSelectContent className="w-50">
                      <OdosSelectItem value="2">2명</OdosSelectItem>
                      <OdosSelectItem value="5">5명</OdosSelectItem>
                      <OdosSelectItem value="10">10명</OdosSelectItem>
                      <OdosSelectItem value="etc">직접 입력 (최대 50명)</OdosSelectItem>
                    </OdosSelectContent>
                  </OdosSelect>
                  <FormMessage />
                </FormItem>
              )}
            />

            {memberCount === 'etc' && (
              <div className="flex items-center gap-2">
                <FormField
                  control={control}
                  name="memberCountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <OdosTextField
                          id="memberCountNumber"
                          className="w-50"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <OdosLabel size="body2" weight="bold">
                  명
                </OdosLabel>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
