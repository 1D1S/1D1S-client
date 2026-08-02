'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { nicknameSchema } from '@module/utils/nickname';
import { phoneNumberSchema } from '@module/utils/phoneNumber';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const GENDER_VALUES = ['MALE', 'FEMALE', 'ETC'] as const;
export const JOB_VALUES = ['STUDENT', 'WORKER'] as const;
export const TOPIC_VALUES = [
  'DEV',
  'EXERCISE',
  'BOOK',
  'DIET',
  'HEALTH',
  'HOBBY',
  'LANGUAGE',
  'SELF_DEV',
  'ETC',
] as const;

export const signupFormSchema = z.object({
  nickname: nicknameSchema,
  // 전화번호·생년월일·성별은 핵심 기능과 무관해 선택 항목이다(App Store
  // 5.1.1(v)). 비우면 통과하고, 값을 넣었을 때만 형식을 검증한다.
  phoneNumber: z.union([z.literal(''), phoneNumberSchema]),
  year: z
    .string()
    .regex(/^\d{4}$/, '올바른 연도를 선택해 주세요.')
    .or(z.literal('')),
  month: z
    .string()
    .regex(/^([1-9]|1[0-2])$/, '올바른 월을 선택해주세요.')
    .or(z.literal('')),
  day: z
    .string()
    .regex(/^([1-9]|[12][0-9]|3[01])$/, '올바른 일을 선택해주세요.')
    .or(z.literal('')),
  gender: z.enum(GENDER_VALUES).optional(),
  job: z.enum(JOB_VALUES, { message: '직업을 선택해 주세요.' }),
  isPublic: z.boolean(),
  topics: z
    .array(z.enum(TOPIC_VALUES))
    .min(1, '관심 주제를 최소 1개 이상 선택해 주세요.')
    .max(3, '관심 주제는 최대 3개까지 선택할 수 있어요.'),
  img: z.instanceof(File).optional(),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
export type SignupTopic = (typeof TOPIC_VALUES)[number];

export function useSignUpForm(): ReturnType<typeof useForm<SignupFormValues>> {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      nickname: '',
      phoneNumber: '',
      year: '',
      month: '',
      day: '',
      isPublic: true,
      topics: [],
    },
  });

  return form;
}
