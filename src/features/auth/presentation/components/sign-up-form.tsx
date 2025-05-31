import { OdosButton } from '@/shared/components/odos-ui/button';
import {
  OdosSelect,
  OdosSelectTrigger,
  OdosSelectValue,
  OdosSelectContent,
  OdosSelectItem,
} from '@/shared/components/odos-ui/dropdown';
import { OdosImagePicker } from '@/shared/components/odos-ui/impage-picker';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosTextField } from '@/shared/components/odos-ui/text-field';
import { SignupFormValues, useSignUpForm } from '../hooks/use-sign-up-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/shared/components/ui/form';
import { OdosToggleGroup, OdosToggleGroupItem } from '@/shared/components/odos-ui/toggle-group';
import { CATEGORY_OPTIONS } from '@/shared/constants/categories';

export function SignUpForm(): React.ReactElement {
  const form = useSignUpForm();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  const onSubmit = (values: SignupFormValues): void => {
    console.log('Form submitted with values:', values);
  };

  return (
    <Form {...form}>
      <form className="flex w-full flex-col items-center" onSubmit={form.handleSubmit(onSubmit)}>
        <OdosSpacing className="h-20" />
        <OdosPageTitle title="1D1S" subtitle="추가 정보 입력" variant="withSubtitle" />

        <OdosSpacing className="h-20" />
        <OdosImagePicker />

        <OdosSpacing className="h-10" />

        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <OdosTextField
                  label="닉네임"
                  placeholder="닉네임을 입력해주세요."
                  id="nickname"
                  className="w-135"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <OdosSpacing className="h-8.5" />

        <div className="flex w-135 flex-col gap-0.5">
          <OdosLabel size="body2" weight="bold">
            생년월일
          </OdosLabel>
          <div className="flex w-full flex-row justify-between">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <OdosSelect onValueChange={field.onChange}>
                    <FormControl>
                      <OdosSelectTrigger>
                        <OdosSelectValue placeholder="연도" />
                      </OdosSelectTrigger>
                    </FormControl>
                    <OdosSelectContent>
                      {yearOptions.map((year) => (
                        <OdosSelectItem key={year} value={String(year)}>
                          {year}
                        </OdosSelectItem>
                      ))}
                    </OdosSelectContent>
                  </OdosSelect>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <OdosSelect onValueChange={field.onChange}>
                    <FormControl>
                      <OdosSelectTrigger>
                        <OdosSelectValue placeholder="월" />
                      </OdosSelectTrigger>
                    </FormControl>
                    <OdosSelectContent>
                      {monthOptions.map((month) => (
                        <OdosSelectItem key={month} value={String(month)}>
                          {month}
                        </OdosSelectItem>
                      ))}
                    </OdosSelectContent>
                  </OdosSelect>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <OdosSelect onValueChange={field.onChange}>
                    <FormControl>
                      <OdosSelectTrigger>
                        <OdosSelectValue placeholder="일" />
                      </OdosSelectTrigger>
                    </FormControl>
                    <OdosSelectContent>
                      {dayOptions.map((day) => (
                        <OdosSelectItem key={day} value={String(day)}>
                          {day}
                        </OdosSelectItem>
                      ))}
                    </OdosSelectContent>
                  </OdosSelect>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <OdosSpacing className="h-10" />
        <div className="flex w-135 flex-col gap-0.5">
          <OdosLabel size="body2" weight="bold">
            성별
          </OdosLabel>
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <OdosSelect onValueChange={field.onChange}>
                  <FormControl>
                    <OdosSelectTrigger>
                      <OdosSelectValue placeholder="성별" />
                    </OdosSelectTrigger>
                  </FormControl>
                  <OdosSelectContent>
                    <OdosSelectItem value="MALE">남성</OdosSelectItem>
                    <OdosSelectItem value="FEMALE">여성</OdosSelectItem>
                  </OdosSelectContent>
                </OdosSelect>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <OdosSpacing className="h-10" />
        <div className="flex w-135 flex-col gap-0.5">
          <OdosLabel size="body2" weight="bold">
            직업
          </OdosLabel>
          <FormField
            control={form.control}
            name="job"
            render={({ field }) => (
              <FormItem>
                <OdosSelect onValueChange={field.onChange}>
                  <FormControl>
                    <OdosSelectTrigger>
                      <OdosSelectValue placeholder="직업" />
                    </OdosSelectTrigger>
                  </FormControl>
                  <OdosSelectContent>
                    <OdosSelectItem value="STUDENT">학생</OdosSelectItem>
                    <OdosSelectItem value="WORKER">직장인</OdosSelectItem>
                  </OdosSelectContent>
                </OdosSelect>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <OdosSpacing className="h-10" />
        <div className="flex w-135 flex-col gap-0.5">
          <OdosLabel size="body2" weight="bold">
            관심 카테고리
          </OdosLabel>
          <OdosToggleGroup type="single" className="max-w-150">
            {CATEGORY_OPTIONS.map((option) => (
              <OdosToggleGroupItem key={option.value} value={option.value} icon={option.icon}>
                {option.label}
              </OdosToggleGroupItem>
            ))}
          </OdosToggleGroup>
        </div>

        <OdosSpacing className="h-17.5" />
        <OdosButton type="submit" className="w-full min-w-140">
          가입하기
        </OdosButton>
      </form>
    </Form>
  );
}
