import { SegmentedControl, Text } from '@1d1s/design-system';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem } from '@/app.component/ui/Form';

import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';

export function ChallengeCreatePhotoSection(): React.ReactElement {
  const { control } = useFormContext<ChallengeCreateFormValues>();

  return (
    <ChallengeCreateSectionCard step={6} title="인증샷">
      <FormField
        control={control}
        name="isPhotoRequired"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <SegmentedControl
                value={field.value ? 'REQUIRED' : 'OPTIONAL'}
                onValueChange={(value) => field.onChange(value === 'REQUIRED')}
                aria-label="인증샷 필수 여부"
                options={[
                  { value: 'OPTIONAL', label: '선택' },
                  { value: 'REQUIRED', label: '필수' },
                ]}
              />
            </FormControl>
            <Text
              size="caption1"
              weight="regular"
              className="mt-1 block text-gray-500"
            >
              {field.value
                ? '일지를 쓸 때 사진(인증샷)을 반드시 첨부해야 해요.'
                : '사진 없이도 일지를 작성할 수 있어요.'}
            </Text>
          </FormItem>
        )}
      />
    </ChallengeCreateSectionCard>
  );
}
