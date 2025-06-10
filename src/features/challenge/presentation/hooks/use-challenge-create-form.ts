'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const challengeCreateFormSchema = z.object({
  periodType: z.enum(['ENDLESS', 'LIMITED']),
  title: z
    .string()
    .min(1, '챌린지 제목을 입력해주세요.')
    .max(50, '챌린지 제목은 50자 이하로 입력해주세요.'),
  category: z.enum(['DEV', 'EXERCISE', 'BOOK', 'MUSIC', 'STUDY', 'LEISURE', 'ECONOMY']).optional(),
  description: z.string().max(500, '챌린지 설명은 500자 이하로 입력해주세요.').optional(),
  period: z.enum(['7', '14', '30', '60', '365', 'etc']).optional(),
  periodNumber: z
    .string()
    .refine(
      (val) => {
        const numberValue = Number(val);
        return !isNaN(numberValue) && numberValue >= 1 && numberValue <= 730;
      },
      {
        message: '1일부터 730일 사이의 숫자를 입력해주세요.',
      }
    )
    .optional(),
  startDate: z.date().optional(),
  participationType: z.enum(['INDIVIDUAL', 'GROUP']),
  memberCount: z.enum(['2', '5', '10', 'etc']).optional(),
  memberCountNumber: z
    .string()
    .refine(
      (val) => {
        const numberValue = Number(val);
        return !isNaN(numberValue) && numberValue >= 1 && numberValue <= 50;
      },
      {
        message: '1명부터 50명 사이의 숫자를 입력해주세요.',
      }
    )
    .optional(),
  goalType: z.enum(['FIXED', 'FLEXIBLE']),
  goals: z.array(
    z.object({
      value: z
        .string()
        .min(1, '목표를 입력해주세요.')
        .max(100, '목표는 100자 이하로 입력해주세요.'),
    })
  ),
});

export type ChallengeCreateFormValues = z.infer<typeof challengeCreateFormSchema>;

export function useChallengeCreateForm(): ReturnType<typeof useForm<ChallengeCreateFormValues>> {
  const form = useForm<ChallengeCreateFormValues>({
    resolver: zodResolver(challengeCreateFormSchema),
    defaultValues: {
      periodType: 'ENDLESS',
      title: '',
      description: '',
      periodNumber: '7',
      participationType: 'INDIVIDUAL',
      memberCountNumber: '2',
      goalType: 'FIXED',
      goals: [{ value: '' }],
    },
  });

  return form;
}
