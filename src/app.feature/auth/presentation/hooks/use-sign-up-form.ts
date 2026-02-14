'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const GENDER_VALUES = ['MALE', 'FEMALE', 'OTHER'] as const;
const OCCUPATION_VALUES = [
  'STUDENT',
  'WORKER',
  'FREELANCER',
  'ENTREPRENEUR',
  'CREATOR',
  'JOB_SEEKER',
  'OTHER',
] as const;
const TOPIC_VALUES = ['DEV', 'EXERCISE', 'BOOK', 'MUSIC', 'STUDY', 'LEISURE', 'ECONOMY'] as const;

export const signupFormSchema = z.object({
  fullName: z
    .string()
    .min(2, '이름은 2자 이상이어야 해요.')
    .max(50, '이름은 50자 이하이어야 해요.'),
  year: z
    .string()
    .nonempty('연도를 선택해 주세요.')
    .regex(/^\d{4}$/, '올바른 연도를 선택해주 세요.'),
  month: z
    .string()
    .nonempty('월을 선택해 주세요.')
    .regex(/^([1-9]|1[0-2])$/, '올바른 월을 선택해주세요.'),
  day: z
    .string()
    .nonempty('일을 선택해 주세요.')
    .regex(/^([1-9]|[12][0-9]|3[01])$/, '올바른 일을 선택해주세요.'),
  gender: z.enum(GENDER_VALUES, { message: '성별을 선택해 주세요.' }),
  job: z.enum(OCCUPATION_VALUES, { message: '직업을 선택해 주세요.' }),
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
      fullName: '',
      year: '',
      month: '',
      day: '',
      topics: [],
    },
  });

  return form;
}
