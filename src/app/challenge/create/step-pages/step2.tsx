// app/challenge/create/components/Step1.tsx
import {
  ChallengeToggleGroup,
  ChallengeToggle,
} from '@/features/challenge/presentation/components/challenge-toggle';
import { ChallengeCreateFormValues } from '@/features/challenge/presentation/hooks/use-challenge-create-form';
import {
  DatePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  Spacing,
  TextField,
} from '@1d1s/design-system';
import { FormControl, FormField, FormItem, FormMessage } from '@/shared/components/ui/form';
import { useFormContext } from 'react-hook-form';

export function Step2(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();
  const periodType = watch('periodType');
  const period = watch('period');

  return (
    <div className="flex w-full flex-col items-start">
      <Spacing className="h-25" />
      <Text size="display2" weight="bold">
        챌린지 기간을 입력해주세요.
      </Text>
      <Spacing className="h-5" />

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
          <Spacing className="h-12" />
          <Text size="heading1" weight="bold">
            기간 선택
          </Text>
          <Spacing className="h-5" />
          <div className="flex gap-5">
            <FormField
              control={control}
              name="period"
              render={({ field }) => (
                <FormItem className="w-50">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-50">
                      <SelectTrigger className="w-50">
                        <SelectValue placeholder="기간을 선택해주세요." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-50">
                      <SelectItem value="7">7일</SelectItem>
                      <SelectItem value="14">14일</SelectItem>
                      <SelectItem value="30">30일</SelectItem>
                      <SelectItem value="60">60일</SelectItem>
                      <SelectItem value="365">1년</SelectItem>
                      <SelectItem value="etc">직접 입력 (최대 2년)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {period === 'etc' && (
              <div className="flex items-center gap-2">
                <FormField
                  control={control}
                  name="periodNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TextField
                          id="periodNumber"
                          className="w-50"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Text size="body2" weight="bold">
                  일
                </Text>
              </div>
            )}
          </div>
          <Spacing className="h-6" />

          <Text size="heading1" weight="bold">
            챌린지 시작 날짜
          </Text>
          <Spacing className="h-5" />

          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <DatePicker value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
}
