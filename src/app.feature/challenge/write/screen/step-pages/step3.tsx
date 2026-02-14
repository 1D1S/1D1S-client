import { ChallengeCreateFormValues } from '@feature/challenge/write/hooks/use-challenge-create-form';
import {
  CheckContainer,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TextField,
} from '@1d1s/design-system';
import { FormControl, FormField, FormItem, FormMessage } from '@component/ui/form';
import { cn } from '@module/lib/utils';
import { User, Users } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function Step3(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();
  const participationType = watch('participationType');
  const memberCount = watch('memberCount');
  const [allowJoinAfterStart, setAllowJoinAfterStart] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-8">
      <div className="space-y-3">
        <Text size="heading1" weight="bold" className="text-gray-900">
          챌린지 형태
        </Text>
        <FormField
          control={control}
          name="participationType"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CheckContainer
                  checked={field.value === 'INDIVIDUAL'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange('INDIVIDUAL');
                    }
                  }}
                  width="100%"
                  height={176}
                  className={cn(
                    '!items-start !justify-start !rounded-3 p-6 text-left',
                    field.value === 'INDIVIDUAL'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="개인 챌린지"
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <User className="h-5 w-5" />
                    </span>
                    <div>
                      <Text size="heading1" weight="bold" className="text-gray-900">
                        개인 챌린지
                      </Text>
                      <Text size="body2" weight="regular" className="mt-2 text-gray-600">
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
                  height={176}
                  className={cn(
                    '!items-start !justify-start !rounded-3 p-6 text-left',
                    field.value === 'GROUP'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="단체 챌린지"
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Users className="h-5 w-5" />
                    </span>
                    <div>
                      <Text size="heading1" weight="bold" className="text-gray-900">
                        단체 챌린지
                      </Text>
                      <Text size="body2" weight="regular" className="mt-2 text-gray-600">
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
        <>
          <div className="space-y-3">
            <Text size="heading1" weight="bold" className="text-gray-900">
              최대 참여 인원
            </Text>
            <FormField
              control={control}
              name="memberCount"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 w-full rounded-2xl">
                        <SelectValue placeholder="참여 인원을 선택해주세요." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2">2명</SelectItem>
                      <SelectItem value="5">5명</SelectItem>
                      <SelectItem value="10">10명</SelectItem>
                      <SelectItem value="etc">직접 입력 (최대 50명)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Text size="body2" weight="regular" className="text-gray-600">
              단체 챌린지 운영을 위해 최대 인원을 설정하세요.
            </Text>
          </div>

          {memberCount === 'etc' ? (
            <div className="space-y-2">
              <Text size="body1" weight="medium" className="text-gray-700">
                직접 입력 (최대 50명)
              </Text>
              <FormField
                control={control}
                name="memberCountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TextField
                        id="memberCountNumber"
                        type="number"
                        className="w-full md:w-[240px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-gray-100 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Text size="body1" weight="bold" className="text-gray-800">
                  중도 참여 수용 <span className="text-gray-500">(선택)</span>
                </Text>
                <Text size="body2" weight="regular" className="mt-1 text-gray-600">
                  챌린지 시작 후에도 새로운 참여자를 받을 수 있습니다.
                </Text>
              </div>
              <Checkbox
                checked={allowJoinAfterStart}
                onCheckedChange={(checked) => setAllowJoinAfterStart(Boolean(checked))}
                aria-label="중도 참여 수용"
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
