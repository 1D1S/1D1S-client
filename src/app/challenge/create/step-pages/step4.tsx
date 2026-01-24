// app/challenge/create/components/Step1.tsx
import {
  ChallengeGoalCreateButton,
  ChallengeGoalDeleteButton,
} from '@/features/challenge/presentation/components/challenge-goal-buttons';
import {
  ChallengeToggleGroup,
  ChallengeToggle,
} from '@/features/challenge/presentation/components/challenge-toggle';
import { ChallengeCreateFormValues } from '@/features/challenge/presentation/hooks/use-challenge-create-form';
import { Text as OdosLabel, Spacing as OdosSpacing, TextField as OdosTextField } from '@1d1s/design-system';
import { FormControl, FormField, FormItem, FormMessage } from '@/shared/components/ui/form';
import { useFieldArray, useFormContext } from 'react-hook-form';

export function Step4(): React.ReactElement {
  const { control } = useFormContext<ChallengeCreateFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'goals',
  });

  return (
    <div>
      <OdosSpacing className="h-25" />
      <OdosLabel size="display2" weight="bold">
        목표를 설정해주세요.
      </OdosLabel>
      <OdosSpacing className="h-5" />

      <FormField
        control={control}
        name="goalType"
        render={({ field }) => (
          <FormItem>
            <ChallengeToggleGroup
              type="single"
              defaultValue="FIXED"
              value={field.value}
              onValueChange={field.onChange}
            >
              <ChallengeToggle
                value="FIXED"
                title="고정 목표"
                subtitle={'주최자가 설정한 목표로\n진행하는 챌린지입니다.'}
                isActive={field.value === 'FIXED'}
                activeImageSrc={'/images/pin-white.png'}
                inactiveImageSrc={'/images/pin-gray.png'}
                imageWidth={36}
                imageHeight={60}
              />
              <ChallengeToggle
                value="FLEXIBLE"
                title="자유 목표"
                subtitle={'참여자 각자의 목표로\n진행하는 챌린지입니다.'}
                isActive={field.value === 'FLEXIBLE'}
                activeImageSrc={'/images/add-white.png'}
                inactiveImageSrc={'/images/add-gray.png'}
                imageWidth={60}
                imageHeight={60}
              />
            </ChallengeToggleGroup>
          </FormItem>
        )}
      />

      <OdosSpacing className="h-12" />
      <OdosLabel size="heading1" weight="bold">
        목표를 설정해주세요.
      </OdosLabel>
      <OdosSpacing className="h-5" />
      {fields.map((field, index) => (
        <FormField
          key={field.id}
          control={control}
          name={`goals.${index}.value`}
          render={({ field }) => (
            <FormItem>
              <div className="flex w-235 items-center gap-2">
                <div className="flex-1">
                  <FormControl>
                    <OdosTextField type="text" placeholder="목표를 입력하세요" {...field} />
                  </FormControl>
                </div>
                <ChallengeGoalDeleteButton type="button" onClick={() => remove(index)} />
              </div>
              <FormMessage />
              <OdosSpacing className="h-2" />
            </FormItem>
          )}
        />
      ))}

      <ChallengeGoalCreateButton type="button" onClick={() => append({ value: '' })}>
        + 목표 추가
      </ChallengeGoalCreateButton>
    </div>
  );
}
