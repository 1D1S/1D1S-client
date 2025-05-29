'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const signupFormSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 해요.')
    .max(50, '닉네임은 50자 이하이어야 해요.'),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export function useSignUpForm(): ReturnType<typeof useForm<SignupFormValues>> {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      nickname: '',
    },
  });

  return form;
}
