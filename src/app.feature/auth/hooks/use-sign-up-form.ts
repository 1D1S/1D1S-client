'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const GENDER_VALUES = ['MALE', 'FEMALE', 'OTHER'] as const;
const JOB_VALUES = ['STUDENT', 'EMPLOYEE', 'OTHER'] as const;
const TOPIC_VALUES = [
  'DEV',
  'EXERCISE',
  'BOOK',
  'MUSIC',
  'STUDY',
  'LEISURE',
  'ECONOMY',
] as const;

export const signupFormSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, '닉네임을 입력해 주세요.')
    .max(8, '닉네임은 8자 이내여야 해요.')
    .regex(
      /^[A-Za-z가-힣]+$/,
      '닉네임은 한글 또는 영어만 사용할 수 있고, 특수문자는 사용할 수 없어요.'
    ),
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
    .min(1, '관심 주제를 최소 1개 이상 선택해 주세요.'),
  img: z.instanceof(File).optional(),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
export type SignupTopic = (typeof TOPIC_VALUES)[number];

export function useSignUpForm(): ReturnType<typeof useForm<SignupFormValues>> {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
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
