import {
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  ImagePicker,
  Text,
  PageTitle,
  Spacing,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@1d1s/design-system';
import { SignupFormValues, useSignUpForm } from '../hooks/use-sign-up-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/shared/components/ui/form';
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
        <Spacing className="h-20" />
        <PageTitle title="1D1S" subtitle="추가 정보 입력" variant="withSubtitle" />

        <Spacing className="h-20" />
        <FormField
          control={form.control}
          name="img"
          render={({ field }) => (
            <FormItem>
              <ImagePicker
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0] || undefined;
                  field.onChange(file);
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <Spacing className="h-10" />

        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextField
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

        <Spacing className="h-8.5" />

        <div className="flex w-135 flex-col gap-0.5">
          <Text size="body2" weight="bold">
            생년월일
          </Text>
          <div className="flex w-full flex-row justify-between">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="연도" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="월" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month} value={String(month)}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="일" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dayOptions.map((day) => (
                        <SelectItem key={day} value={String(day)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Spacing className="h-10" />
        <div className="flex w-135 flex-col gap-0.5">
          <Text size="body2" weight="bold">
            성별
          </Text>
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="성별" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">남성</SelectItem>
                    <SelectItem value="FEMALE">여성</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Spacing className="h-10" />
        <div className="flex w-135 flex-col gap-0.5">
          <Text size="body2" weight="bold">
            직업
          </Text>
          <FormField
            control={form.control}
            name="job"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="직업" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STUDENT">학생</SelectItem>
                    <SelectItem value="WORKER">직장인</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Spacing className="h-10" />
        <div className="flex w-135 flex-col gap-0.5">
          <Text size="body2" weight="bold">
            관심 카테고리
          </Text>
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <ToggleGroup
                  type="single"
                  className="max-w-150"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <ToggleGroupItem key={option.value} value={option.value} icon={option.icon}>
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Spacing className="h-17.5" />
        <Button type="submit" className="w-full min-w-140">
          가입하기
        </Button>
      </form>
    </Form>
  );
}
