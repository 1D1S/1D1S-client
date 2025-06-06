'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const challengeCreateFormSchema = z.object({
  period: z.enum(['ENDLESS', 'LIMITED']),
  title: z
    .string()
    .min(1, '챌린지 제목을 입력해주세요.')
    .max(50, '챌린지 제목은 50자 이하로 입력해주세요.'),
  category: z.enum(['DEV', 'EXERCISE', 'BOOK', 'MUSIC', 'STUDY', 'LEISURE', 'ECONOMY']).optional(),
  description: z.string().max(500, '챌린지 설명은 500자 이하로 입력해주세요.').optional(),
});

export type ChallengeCreateFormValues = z.infer<typeof challengeCreateFormSchema>;

export function useChallengeCreateForm(): ReturnType<typeof useForm<ChallengeCreateFormValues>> {
  const form = useForm<ChallengeCreateFormValues>({
    resolver: zodResolver(challengeCreateFormSchema),
    defaultValues: {
      period: 'ENDLESS',
      title: '',
      description: '',
    },
  });

  return form;
}
