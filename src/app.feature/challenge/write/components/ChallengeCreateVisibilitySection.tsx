import { SegmentedControl, Text, TextField } from '@1d1s/design-system';
import { Globe, Lock } from 'lucide-react';
import { type ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app.component/ui/Form';

import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';

export function ChallengeCreateVisibilitySection(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();
  const challengeType = watch('challengeType');
  const isPrivate = challengeType === 'PRIVATE';

  return (
    <ChallengeCreateSectionCard step={5} title="공개 설정">
      <FormField
        control={control}
        name="challengeType"
        render={({ field }) => (
          <FormItem>
            <SegmentedControl
              value={field.value}
              onValueChange={field.onChange}
              aria-label="공개 범위"
              options={[
                {
                  value: 'PUBLIC',
                  label: '공개',
                  icon: <Globe className="h-5 w-5" />,
                },
                {
                  value: 'PRIVATE',
                  label: '비공개',
                  icon: <Lock className="h-5 w-5" />,
                },
              ]}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <Text
        size="caption1"
        weight="regular"
        className="mt-3 block text-gray-500"
      >
        {isPrivate
          ? '링크와 비밀번호를 아는 사람만 참여할 수 있어요. 목록에는 노출되지 않아요.'
          : '누구나 챌린지를 찾아보고 참여할 수 있어요.'}
      </Text>

      {isPrivate ? (
        <div className="mt-5 space-y-2">
          <Text size="caption1" weight="bold" className="block text-gray-600">
            참여 비밀번호
          </Text>
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TextField
                    type="password"
                    inputMode="text"
                    autoComplete="new-password"
                    maxLength={20}
                    placeholder="4 ~ 20자"
                    className="w-full"
                    value={field.value ?? ''}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      field.onChange(event.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Text
            size="caption1"
            weight="regular"
            className="block text-gray-500"
          >
            생성 후 참여 링크와 함께 비밀번호를 공유하면 친구를 초대할 수 있어요.
          </Text>
        </div>
      ) : null}
    </ChallengeCreateSectionCard>
  );
}
