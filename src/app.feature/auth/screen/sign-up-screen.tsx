import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  CheckContainer,
  Icon,
  ImagePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@1d1s/design-system';
import { SignupFormValues, useSignUpForm } from '../hooks/use-sign-up-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@component/ui/form';
import {
  SIGN_UP_GENDER_OPTIONS,
  SIGN_UP_OCCUPATION_OPTIONS,
  SIGN_UP_TOPIC_OPTIONS,
  SignUpGenderValue,
} from '../consts/sign-up-options';

type Step = 1 | 2;

function SignUpHeader({
  step,
  totalSteps,
  onBack,
}: {
  step: Step;
  totalSteps: number;
  onBack(): void;
}): React.ReactElement {
  return (
    <header className="h-14 border-b border-gray-200 bg-white px-4">
      <div className="relative flex h-full items-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="가입 나가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>

        <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const active = step === index + 1;

            return (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-main-500' : 'bg-gray-300'}`}
              />
            );
          })}
        </div>
      </div>
    </header>
  );
}

export function SignUpScreen(): React.ReactElement {
  const router = useRouter();
  const form = useSignUpForm();
  const [step, setStep] = React.useState<Step>(1);
  const totalSteps = 2;
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  const onSubmit = (values: SignupFormValues): void => {
    console.log('Form submitted with values:', values);
  };

  const handleBack = (): void => {
    if (step === 2) {
      setStep(1);
      return;
    }

    router.push('/login');
  };

  const handleNextStep = async (): Promise<void> => {
    const stepOneValid = await form.trigger(['fullName', 'year', 'month', 'day', 'gender', 'job']);

    if (!stepOneValid) {
      return;
    }

    setStep(2);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <SignUpHeader step={step} totalSteps={totalSteps} onBack={handleBack} />

      <Form {...form}>
        <form className="flex flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 ? (
            <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center px-6 py-10">
              <div className="grid w-full gap-10 lg:grid-cols-[1fr_1.15fr]">
                <section className="flex flex-col justify-center">
                  <Text size="caption3" weight="medium" className="text-gray-600">
                    Step 1 : Personal Profile
                  </Text>
                  <Text size="display1" weight="bold" className="mt-4 text-gray-900">
                    Tell us about
                  </Text>
                  <Text size="display1" weight="bold" className="text-main-600">
                    yourself.
                  </Text>
                  <Text size="body2" weight="regular" className="mt-3 text-gray-600">
                    몇 가지 정보를 입력하고 맞춤 챌린지를 추천받아보세요.
                  </Text>

                  <div className="mt-10">
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
                  </div>
                </section>

                <section className="rounded-4 border border-gray-200 bg-white p-6 shadow-[0_8px_20px_rgba(34,34,34,0.04)] lg:p-8">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TextField
                            label="이름"
                            placeholder="예: Alex Morgan"
                            id="fullName"
                            className="w-full"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-5">
                    <Text size="body2" weight="bold" className="mb-1 text-gray-800">
                      생년월일
                    </Text>
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full !min-w-0">
                                  <SelectValue placeholder="년" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {yearOptions.map((year) => (
                                  <SelectItem key={year} value={String(year)}>
                                    {year}년
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
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full !min-w-0">
                                  <SelectValue placeholder="월" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {monthOptions.map((month) => (
                                  <SelectItem key={month} value={String(month)}>
                                    {month}월
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
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full !min-w-0">
                                  <SelectValue placeholder="일" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dayOptions.map((day) => (
                                  <SelectItem key={day} value={String(day)}>
                                    {day}일
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

                  <div className="mt-5">
                    <Text size="body2" weight="bold" className="mb-1 text-gray-800">
                      성별
                    </Text>
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <ToggleGroup
                            type="single"
                            value={field.value}
                            onValueChange={(value) => {
                              if (value) {
                                field.onChange(value as SignUpGenderValue);
                              }
                            }}
                            className="grid grid-cols-3 gap-2"
                          >
                            {SIGN_UP_GENDER_OPTIONS.map((option) => (
                              <ToggleGroupItem
                                key={option.value}
                                value={option.value}
                                shape="square"
                                className="h-10 w-full justify-center px-0"
                              >
                                {option.label}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-5">
                    <Text size="body2" weight="bold" className="mb-1 text-gray-800">
                      직업
                    </Text>
                    <FormField
                      control={form.control}
                      name="job"
                      render={({ field }) => (
                        <FormItem>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full !min-w-0">
                                <SelectValue placeholder="직업 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SIGN_UP_OCCUPATION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button type="button" size="medium" onClick={handleNextStep}>
                      다음 단계
                    </Button>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center px-6 py-10">
              <div className="grid w-full gap-10 lg:grid-cols-[1fr_1.15fr]">
                <section className="flex flex-col justify-center">
                  <Text size="caption3" weight="medium" className="text-gray-600">
                    Step 2 : Interests
                  </Text>
                  <Text size="display1" weight="bold" className="mt-4 text-gray-900">
                    What are you
                  </Text>
                  <Text size="display1" weight="bold" className="text-main-600">
                    passionate about?
                  </Text>
                  <Text size="body2" weight="regular" className="mt-3 text-gray-600">
                    도전하고 싶은 관심 주제를 선택해주세요.
                  </Text>
                </section>

                <section className="rounded-4 border border-gray-200 bg-white p-6 shadow-[0_8px_20px_rgba(34,34,34,0.04)] lg:p-8">
                  <FormField
                    control={form.control}
                    name="topics"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                          {SIGN_UP_TOPIC_OPTIONS.map((option) => {
                            const checked = field.value.includes(option.value);

                            return (
                              <CheckContainer
                                key={option.value}
                                type="button"
                                checked={checked}
                                onCheckedChange={(nextChecked) => {
                                  const currentTopics = field.value;
                                  const nextTopics = nextChecked
                                    ? [...currentTopics, option.value]
                                    : currentTopics.filter((topic) => topic !== option.value);

                                  field.onChange(nextTopics);
                                }}
                                width="100%"
                                height={96}
                                showCheckIndicator={false}
                                className="rounded-3 w-full min-w-0 border border-gray-200 px-3"
                              >
                                <div className="flex w-full flex-col items-center justify-center gap-2">
                                  <span className="text-xl leading-none">{option.icon}</span>
                                  <Text size="body2" weight="medium" className="text-gray-700">
                                    {option.label}
                                  </Text>
                                </div>
                              </CheckContainer>
                            );
                          })}
                        </div>
                        <div className="mt-4 text-left">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="mt-8 flex justify-end">
                    <Button type="submit" size="medium">
                      가입 완료
                    </Button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
