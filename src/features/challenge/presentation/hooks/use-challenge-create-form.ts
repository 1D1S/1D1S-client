'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const challengeCreateFormSchema = z.object({
  period: z.enum(['ENDLESS', 'LIMITED']),
});

export type ChallengeCreateFormValues = z.infer<typeof challengeCreateFormSchema>;

export function useChallengeCreateForm(): ReturnType<typeof useForm<ChallengeCreateFormValues>> {
  const form = useForm<ChallengeCreateFormValues>({
    resolver: zodResolver(challengeCreateFormSchema),
    defaultValues: {
      period: 'ENDLESS',
    },
  });

  return form;
}
