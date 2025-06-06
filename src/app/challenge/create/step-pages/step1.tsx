import { OdosLabel } from '@/shared/components/odos-ui/label';
import { useFormContext } from 'react-hook-form';
import { ChallengeCreateFormValues } from '@/features/challenge/presentation/hooks/use-challenge-create-form';
import { FormControl, FormField, FormItem, FormMessage } from '@/shared/components/ui/form';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosTextField } from '@/shared/components/odos-ui/text-field';
import { OdosToggleGroup, OdosToggleGroupItem } from '@/shared/components/odos-ui/toggle-group';
import { CATEGORY_OPTIONS } from '@/shared/constants/categories';
import { OdosTextArea } from '@/shared/components/odos-ui/text-area';

export function Step1(): React.ReactElement {
  const { control } = useFormContext<ChallengeCreateFormValues>();
  return (
    <div className="w-full">
      <OdosSpacing className="h-20" />
      <OdosLabel size="display2" weight="bold">
        챌린지 정보를 입력해주세요.
      </OdosLabel>
      <OdosSpacing className="h-10" />

      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <OdosTextField
                label="제목"
                placeholder="챌린지 제목"
                id="title"
                className="w-235"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <OdosSpacing className="h-7.5" />
      <div className="flex w-235 flex-col gap-2">
        <OdosLabel size="body2" weight="bold">
          카테고리
        </OdosLabel>
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <OdosToggleGroup
                type="single"
                className="max-w-235"
                value={field.value}
                onValueChange={field.onChange}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <OdosToggleGroupItem key={option.value} value={option.value} icon={option.icon}>
                    {option.label}
                  </OdosToggleGroupItem>
                ))}
              </OdosToggleGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <OdosSpacing className="h-7.5" />
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <OdosTextArea
                  label="설명"
                  placeholder="챌린지 설명(선택)"
                  id="description"
                  className="h-25 w-235"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
