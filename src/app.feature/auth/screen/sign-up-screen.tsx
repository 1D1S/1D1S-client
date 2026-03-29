'use client';

import {
  AvatarImagePicker,
  Button,
  CheckContainer,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StepIndicator,
  Text,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@1d1s/design-system';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@component/ui/form';
import { MEMBER_QUERY_KEYS } from '@feature/member/consts/query-keys';
import { notifyApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

import { authApi } from '../api/auth-api';
import {
  SIGN_UP_GENDER_OPTIONS,
  SIGN_UP_OCCUPATION_OPTIONS,
  SIGN_UP_TOPIC_OPTIONS,
  SignUpGenderValue,
} from '../consts/sign-up-options';
import { SignupFormValues, useSignUpForm } from '../hooks/use-sign-up-form';
import { CategoryType, GenderType, JobType } from '../type/auth';

type Step = 1 | 2;
const SIGN_UP_STEPS = [
  { id: 'profile', label: '프로필 설정' },
  { id: 'topics', label: '관심 주제' },
];
const SIGN_UP_LEFT_VISUAL_SIZE = 200;
const SIGN_UP_LEFT_VISUAL_SLOT_HEIGHT = 280;

function SignUpHeader({ onBack }: { onBack(): void }): React.ReactElement {
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
      </div>
    </header>
  );
}

export function SignUpScreen(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useSignUpForm();
  const [step, setStep] = React.useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showExitDialog, setShowExitDialog] = React.useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = React.useState<
    string | undefined
  >();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const selectedTopics = form.watch('topics') ?? [];

  const onSubmit = async (values: SignupFormValues): Promise<void> => {
    const accessToken = authStorage.getAccessToken();
    if (!accessToken) {
      toast.error('로그인이 필요합니다.');
      router.replace('/login');
      return;
    }

    const birth = `${values.year}-${values.month.padStart(2, '0')}-${values.day.padStart(2, '0')}`;

    setIsSubmitting(true);
    try {
      let profileImageKey: string | undefined;

      if (values.img) {
        const { data: presigned } = await authApi.getPresignedUrl(
          { fileName: values.img.name, fileType: values.img.type },
          accessToken
        );
        await fetch(presigned.presignedUrl, {
          method: 'PUT',
          body: values.img,
          headers: { 'Content-Type': values.img.type },
        });
        profileImageKey = presigned.objectKey;
      }

      await authApi.completeSignUpInfo(
        {
          nickname: values.nickname,
          job: values.job as JobType,
          birth,
          gender: values.gender as GenderType,
          isPublic: values.isPublic,
          category: values.topics as CategoryType[],
          profileImageKey,
        },
        accessToken
      );

      toast.success('가입이 완료되었습니다!');
      await queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.sidebar(),
      });
      router.replace('/');
    } catch (error) {
      notifyApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = (): void => {
    if (step === 2) {
      setStep(1);
      return;
    }

    setShowExitDialog(true);
  };

  const handleExitConfirm = (): void => {
    setShowExitDialog(false);
    authStorage.clearTokens();
    router.replace('/');
  };

  const handleNextStep = async (): Promise<void> => {
    const stepOneValid = await form.trigger([
      'nickname',
      'year',
      'month',
      'day',
      'gender',
      'job',
    ]);

    if (!stepOneValid) {
      return;
    }

    setStep(2);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 lg:h-screen lg:overflow-hidden">
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="gap-6 px-8 py-6 sm:max-w-[380px] sm:px-6">
          <DialogHeader className="items-center text-center sm:text-center">
            <DialogTitle>정말 나가시겠어요?</DialogTitle>
          </DialogHeader>
          <DialogDescription className="block w-full text-center">
            정보를 입력하지 않으면 서비스 사용이 어렵습니다.
          </DialogDescription>
          <DialogFooter className="flex-row gap-2">
            <Button
              size="medium"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowExitDialog(false)}
            >
              계속 입력하기
            </Button>
            <Button
              size="medium"
              className="flex-1"
              onClick={handleExitConfirm}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SignUpHeader onBack={handleBack} />

      <Form {...form}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="mx-auto w-full max-w-[1080px] px-4 pt-10 pb-10">
            <StepIndicator
              steps={SIGN_UP_STEPS}
              currentStep={step}
              size="sm"
              className="w-full"
            />
          </div>

          {step === 1 ? (
            <div className="mx-auto flex w-full max-w-[1080px] flex-1 items-stretch px-4 pb-5">
              <div className="grid w-full gap-6 lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="flex min-h-0 flex-col pt-2 text-left">
                  <Text size="display2" weight="bold" className="text-gray-900">
                    나에 대해 알려주세요.
                  </Text>
                  <Text
                    size="body2"
                    weight="regular"
                    className="mt-3 text-gray-600"
                  >
                    몇 가지 정보를 입력하고 맞춤 챌린지를 추천받아보세요.
                  </Text>

                  <div className="mt-6 flex justify-center lg:mt-8">
                    <FormField
                      control={form.control}
                      name="img"
                      render={({ field }) => (
                        <FormItem>
                          <AvatarImagePicker
                            size={SIGN_UP_LEFT_VISUAL_SIZE}
                            defaultImageUrl={imgPreviewUrl}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const file = event.target.files?.[0] || undefined;
                              field.onChange(file);
                              if (file) {
                                setImgPreviewUrl(URL.createObjectURL(file));
                              }
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section className="rounded-4 flex min-h-0 flex-col border border-gray-200 bg-white p-5 shadow-[0_8px_20px_rgba(34,34,34,0.04)] lg:max-h-[620px] lg:self-start lg:overflow-y-auto lg:p-6">
                  <FormField
                    control={form.control}
                    name="nickname"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TextField
                            label="닉네임"
                            placeholder="예: 챌린저123"
                            id="nickname"
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
                    <Text
                      size="body2"
                      weight="bold"
                      className="mb-1 text-gray-800"
                    >
                      생년월일
                    </Text>
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
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
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
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
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
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
                    <Text
                      size="body2"
                      weight="bold"
                      className="mb-1 text-gray-800"
                    >
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
                    <Text
                      size="body2"
                      weight="bold"
                      className="mb-1 text-gray-800"
                    >
                      직업
                    </Text>
                    <FormField
                      control={form.control}
                      name="job"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full !min-w-0">
                                <SelectValue placeholder="직업 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SIGN_UP_OCCUPATION_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
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

                  <div className="mt-5">
                    <Text
                      size="body2"
                      weight="bold"
                      className="mb-1 text-gray-800"
                    >
                      프로필 공개
                    </Text>
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem>
                          <ToggleGroup
                            type="single"
                            value={field.value ? 'public' : 'private'}
                            onValueChange={(value) => {
                              if (value) {
                                field.onChange(value === 'public');
                              }
                            }}
                            className="grid grid-cols-2 gap-2"
                          >
                            <ToggleGroupItem
                              value="public"
                              shape="square"
                              className="h-10 w-full justify-center px-0"
                            >
                              공개
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="private"
                              shape="square"
                              className="h-10 w-full justify-center px-0"
                            >
                              비공개
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button
                      type="button"
                      size="medium"
                      onClick={handleNextStep}
                    >
                      다음 단계
                    </Button>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[1080px] flex-1 items-stretch px-4 pb-5">
              <div className="grid w-full gap-6 lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="flex min-h-0 flex-col pt-2 text-left">
                  <Text size="display2" weight="bold" className="text-gray-900">
                    어떤 주제에 관심이 있나요?
                  </Text>
                  <Text
                    size="body2"
                    weight="regular"
                    className="mt-3 text-gray-600"
                  >
                    도전하고 싶은 관심 주제를 선택해주세요.
                  </Text>
                  <div
                    aria-hidden
                    className="mt-6 hidden lg:mt-8 lg:block"
                    style={{ height: SIGN_UP_LEFT_VISUAL_SLOT_HEIGHT }}
                  />
                </section>

                <section className="rounded-4 flex min-h-0 flex-col border border-gray-200 bg-white p-5 shadow-[0_8px_20px_rgba(34,34,34,0.04)] lg:max-h-[620px] lg:self-start lg:overflow-y-auto lg:p-6">
                  <FormField
                    control={form.control}
                    name="topics"
                    render={({ field }) => (
                      <FormItem>
                        <Text
                          size="body2"
                          weight="regular"
                          className="mb-3 text-gray-500"
                        >
                          최대 3개까지 선택할 수 있어요.
                        </Text>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                          {SIGN_UP_TOPIC_OPTIONS.map((option) => {
                            const checked = Array.isArray(selectedTopics)
                              ? selectedTopics.includes(option.value)
                              : false;
                            const isMaxReached = selectedTopics.length >= 3;

                            return (
                              <CheckContainer
                                key={option.value}
                                type="button"
                                checked={checked}
                                disabled={!checked && isMaxReached}
                                onCheckedChange={(nextChecked) => {
                                  const currentTopics = Array.isArray(
                                    form.getValues('topics')
                                  )
                                    ? form.getValues('topics')
                                    : [];
                                  if (
                                    nextChecked &&
                                    currentTopics.length >= 3
                                  ) {
                                    return;
                                  }
                                  const nextTopics = nextChecked
                                    ? Array.from(
                                        new Set([
                                          ...currentTopics,
                                          option.value,
                                        ])
                                      )
                                    : currentTopics.filter(
                                        (topic) => topic !== option.value
                                      );

                                  field.onChange(nextTopics);
                                }}
                                width="100%"
                                height={96}
                                showCheckIndicator
                                className="rounded-3 w-full min-w-0 px-3"
                              >
                                <div className="flex w-full flex-col items-center justify-center gap-2">
                                  <span className="text-xl leading-none">
                                    {option.icon}
                                  </span>
                                  <Text
                                    size="body2"
                                    weight="medium"
                                    className="text-gray-700"
                                  >
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

                  <div className="mt-8 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      size="medium"
                      variant="outlined"
                      disabled={isSubmitting}
                      onClick={() => setStep(1)}
                    >
                      이전 단계
                    </Button>
                    <Button
                      type="button"
                      size="medium"
                      disabled={isSubmitting}
                      onClick={() => void form.handleSubmit(onSubmit)()}
                    >
                      {isSubmitting ? '처리 중...' : '가입 완료'}
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
