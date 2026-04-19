import { CheckContainer, Text } from '@1d1s/design-system';
import {
  FormField,
  FormItem,
  FormMessage,
} from '@component/ui/Form';
import { MaxParticipantCountSelect } from '@feature/challenge/write/components/MaxParticipantCountSelect';
import { ChallengeCreateFormValues } from '@feature/challenge/write/hooks/useChallengeCreateForm';
import { cn } from '@module/utils/cn';
import { User, Users } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export function Step2(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();
  const participationType = watch('participationType');

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-4">
      <div className="flex flex-col space-y-3">
        <Text size="body1" weight="bold" className="text-gray-900">
          챌린지 형태
        </Text>
        <FormField
          control={control}
          name="participationType"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-2 gap-4">
                <CheckContainer
                  checked={field.value === 'INDIVIDUAL'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange('INDIVIDUAL');
                    }
                  }}
                  width="100%"
                  className={cn(
                    '!rounded-3 !h-auto !items-start !justify-start p-5 text-left hover:cursor-pointer',
                    field.value === 'INDIVIDUAL'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="개인 챌린지"
                >
                  <div className="flex h-full flex-col gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <User className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <Text
                        size="body1"
                        weight="bold"
                        className="text-gray-900"
                      >
                        개인 챌린지
                      </Text>
                      <Text
                        size="body2"
                        weight="regular"
                        className="mt-1 text-gray-600"
                      >
                        혼자 진행하는 챌린지입니다.
                      </Text>
                    </div>
                  </div>
                </CheckContainer>

                <CheckContainer
                  checked={field.value === 'GROUP'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange('GROUP');
                    }
                  }}
                  width="100%"
                  className={cn(
                    '!rounded-3 !h-auto !items-start !justify-start p-5 text-left hover:cursor-pointer',
                    field.value === 'GROUP'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="단체 챌린지"
                >
                  <div className="flex h-full flex-col gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Users className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <Text
                        size="body1"
                        weight="bold"
                        className="text-gray-900"
                      >
                        단체 챌린지
                      </Text>
                      <Text
                        size="body2"
                        weight="regular"
                        className="mt-1 text-gray-600"
                      >
                        다른 참여자와 함께 목표를 달성합니다.
                      </Text>
                    </div>
                  </div>
                </CheckContainer>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {participationType === 'GROUP' ? (
        <div className="flex flex-col space-y-3">
          <Text size="body1" weight="bold" className="text-gray-900">
            최대 참여 인원
          </Text>
          <FormField
            control={control}
            name="memberCount"
            render={({ field }) => (
              <FormItem>
                <FormField
                  control={control}
                  name="memberCountNumber"
                  render={({ field: customField }) => (
                    <MaxParticipantCountSelect
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      customValue={customField.value ?? ''}
                      onCustomValueChange={customField.onChange}
                    />
                  )}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
