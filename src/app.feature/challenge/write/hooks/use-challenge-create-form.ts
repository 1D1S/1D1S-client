'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const challengeCreateFormSchema = z
  .object({
    title: z
      .string()
      .min(1, '챌린지 제목을 입력해주세요.')
      .max(50, '챌린지 제목은 50자 이하로 입력해주세요.'),
    // 카테고리를 필수로 하고, 선택하지 않았을 때 에러 메시지 지정
    category: z.enum(
      ['DEV', 'EXERCISE', 'BOOK', 'MUSIC', 'STUDY', 'LEISURE', 'ECONOMY'],
      {
        message: '카테고리를 선택해주세요.',
      }
    ),
    description: z
      .string()
      .max(500, '챌린지 설명은 500자 이하로 입력해주세요.')
      .optional(),
    periodType: z.enum(['ENDLESS', 'LIMITED']),
    period: z.enum(['7', '14', '30', '60', '365', 'etc']).optional(),
    periodNumber: z.string().refine(
      (val) => {
        const numberValue = Number(val);
        return !isNaN(numberValue) && numberValue >= 1 && numberValue <= 730;
      },
      { message: '1일부터 730일 사이의 숫자를 입력해주세요.' }
    ),
    startDate: z.date().optional(),
    participationType: z.enum(['INDIVIDUAL', 'GROUP']),
    memberCount: z.enum(['2', '5', '10', 'etc']).optional(),
    memberCountNumber: z.string().refine(
      (val) => {
        const numberValue = Number(val);
        return !isNaN(numberValue) && numberValue >= 1 && numberValue <= 50;
      },
      { message: '1명부터 50명 사이의 숫자를 입력해주세요.' }
    ),
    goalType: z.enum(['FIXED', 'FLEXIBLE']),
    goals: z.array(
      z.object({
        value: z
          .string()
          .min(1, '목표를 입력해주세요.')
          .max(100, '목표는 100자 이하로 입력해주세요.'),
      })
    ),
  })
  .superRefine((data, ctx) => {
    if (data.periodType === 'LIMITED') {
      if (!data.period) {
        ctx.addIssue({
          path: ['period'],
          code: z.ZodIssueCode.custom,
          message: '챌린지 기간이 선택되지 않았습니다.',
        });
      }
      if (!data.startDate) {
        ctx.addIssue({
          path: ['startDate'],
          code: z.ZodIssueCode.custom,
          message: '시작일이 선택되지 않았습니다.',
        });
      }
    }
    if (data.participationType === 'GROUP') {
      if (!data.memberCount) {
        ctx.addIssue({
          path: ['memberCount'],
          code: z.ZodIssueCode.custom,
          message: '챌린지 인원이 선택되지 않았습니다.',
        });
      }
    }
    if (data.goals.length === 0) {
      ctx.addIssue({
        path: ['goals'],
        code: z.ZodIssueCode.custom,
        message: '목표를 하나 이상 입력해주세요.',
      });
    }
  });

export type ChallengeCreateFormValues = z.infer<
  typeof challengeCreateFormSchema
>;

export function useChallengeCreateForm(): ReturnType<
  typeof useForm<ChallengeCreateFormValues>
> {
  const form = useForm<ChallengeCreateFormValues>({
    shouldUnregister: false,
    mode: 'onChange',
    resolver: zodResolver(challengeCreateFormSchema),
    defaultValues: {
      periodType: 'ENDLESS',
      title: '',
      category: undefined,
      description: '',
      periodNumber: '7',
      participationType: 'INDIVIDUAL',
      memberCountNumber: '2',
      goalType: 'FIXED',
      goals: [],
    },
  });

  return form;
}
