'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { nicknameSchema } from '@module/utils/nickname';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const GENDER_VALUES = ['MALE', 'FEMALE', 'ETC'] as const;
export const JOB_VALUES = ['STUDENT', 'WORKER'] as const;
export const TOPIC_VALUES = [
  'DEV',
  'EXERCISE',
  'BOOK',
  'MUSIC',
  'STUDY',
  'LEISURE',
  'ECONOMY',
] as const;

export const signupFormSchema = z.object({
  nickname: nicknameSchema,
  year: z
    .string()
    .nonempty('연도를 선택해 주세요.')
    .regex(/^\d{4}$/, '올바른 연도를 선택해 주세요.'),
  month: z
    .string()
    .nonempty('월을 선택해 주세요.')
    .regex(/^([1-9]|1[0-2])$/, '올바른 월을 선택해주세요.'),
  day: z
    .string()
    .nonempty('일을 선택해 주세요.')
    .regex(/^([1-9]|[12][0-9]|3[01])$/, '올바른 일을 선택해주세요.'),
  gender: z.enum(GENDER_VALUES, { message: '성별을 선택해 주세요.' }),
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
      year: '',
      month: '',
      day: '',
      isPublic: true,
      topics: [],
    },
  });

  return form;
}
