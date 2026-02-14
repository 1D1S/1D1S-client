import {
  CheckContainer,
  Text,
  TextField,
} from '@1d1s/design-system';
import { useFormContext } from 'react-hook-form';
import { ChallengeCreateFormValues } from '@feature/challenge/write/hooks/use-challenge-create-form';
import { FormControl, FormField, FormItem, FormMessage } from '@component/ui/form';
import { CATEGORY_OPTIONS } from '@constants/categories';
import { cn } from '@module/lib/utils';

export function Step1(): React.ReactElement {
  const { control } = useFormContext<ChallengeCreateFormValues>();

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-8">
      <div className="space-y-2">
        <Text size="heading1" weight="bold" className="text-gray-900">
          챌린지 제목 <span className="text-main-800">*</span>
        </Text>
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextField
                  id="title"
                  placeholder="예: 아침 30분 러닝"
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-3">
        <Text size="heading1" weight="bold" className="text-gray-900">
          카테고리
        </Text>
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-wrap gap-3">
                {CATEGORY_OPTIONS.map((option) => {
                  const isSelected = field.value === option.value;

                  return (
                    <CheckContainer
                      key={option.value}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange(option.value);
                        }
                      }}
                      showCheckIndicator={false}
                      width="auto"
                      height={48}
                      className={cn(
                        '!min-w-[128px] !rounded-full !border px-4',
                        isSelected
                          ? '!border-main-800 !bg-main-800 !text-white'
                          : '!border-gray-300 !bg-white !text-gray-700'
                      )}
                      aria-label={`${option.label} 카테고리`}
                    >
                      <div className="flex items-center gap-2">
                        <span aria-hidden>{option.icon}</span>
                        <Text
                          size="body1"
                          weight="medium"
                          className={isSelected ? 'text-white' : 'text-gray-700'}
                        >
                          {option.label}
                        </Text>
                      </div>
                    </CheckContainer>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <Text size="heading1" weight="bold" className="text-gray-900">
          설명 <span className="text-gray-500">(선택)</span>
        </Text>
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextField
                  id="description"
                  multiline
                  rows={8}
                  placeholder="챌린지 소개와 진행 방법을 자유롭게 적어주세요."
                  className="w-full"
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
