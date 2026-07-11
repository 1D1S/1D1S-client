import { SegmentedControl, Text } from '@1d1s/design-system';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem } from '@/app.component/ui/Form';

import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';

type SectionElement = React.ReactElement | null;

export function ChallengeCreatePostEndWriteSection(): SectionElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();

  // 무제한 챌린지는 종료일이 없어 유예 개념이 성립하지 않는다.
  if (watch('periodType') === 'ENDLESS') {
    return null;
  }

  return (
    <ChallengeCreateSectionCard step={7} title="종료 후 작성">
      <FormField
        control={control}
        name="postEndWriteAllowed"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <SegmentedControl
                value={field.value ? 'ALLOWED' : 'BLOCKED'}
                onValueChange={(value) => field.onChange(value === 'ALLOWED')}
                aria-label="종료 후 일지 작성 허용 여부"
                options={[
                  { value: 'BLOCKED', label: '불가' },
                  { value: 'ALLOWED', label: '허용' },
                ]}
              />
            </FormControl>
            <Text
              size="caption1"
              weight="regular"
              className="mt-1 block text-gray-500"
            >
              {field.value
                ? '챌린지 종료 후 2일간 일지를 작성할 수 있어요.'
                : '챌린지가 종료되면 더 이상 일지를 작성할 수 없어요.'}
            </Text>
          </FormItem>
        )}
      />
    </ChallengeCreateSectionCard>
  );
}
