'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const signupFormSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 해요.')
    .max(50, '닉네임은 50자 이하이어야 해요.'),
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
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  job: z.enum(['STUDENT', 'WORKER']).optional(),
  category: z.enum(['DEV', 'EXERCISE', 'BOOK', 'MUSIC', 'STUDY', 'LEISURE', 'ECONOMY']).optional(),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export function useSignUpForm(): ReturnType<typeof useForm<SignupFormValues>> {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      nickname: '',
      year: '',
      month: '',
      day: '',
    },
  });

  return form;
}
