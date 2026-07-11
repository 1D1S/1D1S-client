'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { startOfToday } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

function isWholeNumberString(value?: string): boolean {
  return Boolean(value && /^\d+$/.test(value));
}

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
      .max(200, '챌린지 설명은 200자 이하로 입력해주세요.')
      .optional(),
    periodType: z.enum(['ENDLESS', 'LIMITED']),
    period: z.enum(['7', '14', '30', '60', '365', 'etc']).optional(),
    periodNumber: z.string().optional(),
    startDate: z.date().optional(),
    participationType: z.enum(['INDIVIDUAL', 'GROUP']),
    memberCount: z.enum(['2', '5', '10', 'etc', 'unlimited']).optional(),
    memberCountNumber: z.string().optional(),
    goalType: z.enum(['FIXED', 'FLEXIBLE']),
    allowMidJoin: z.boolean(),
    isPhotoRequired: z.boolean(),
    // 종료 후 2일 유예 동안 일지 작성 허용 여부.
    postEndWriteAllowed: z.boolean(),
    // 공개 범위 — 생성 시에는 공개/비공개만 선택할 수 있다.
    challengeType: z.enum(['PUBLIC', 'PRIVATE']),
    password: z.string().optional(),
    thumbnailImageKey: z.string().optional(),
    thumbnailPreviewUrl: z.string().optional(),
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
    if (!data.startDate) {
      ctx.addIssue({
        path: ['startDate'],
        code: z.ZodIssueCode.custom,
        message: '시작일이 선택되지 않았습니다.',
      });
    } else if (data.startDate < startOfToday()) {
      ctx.addIssue({
        path: ['startDate'],
        code: z.ZodIssueCode.custom,
        message: '시작일은 오늘 이후로 선택해주세요.',
      });
    }
    if (data.periodType === 'LIMITED') {
      if (!data.period) {
        ctx.addIssue({
          path: ['period'],
          code: z.ZodIssueCode.custom,
          message: '챌린지 기간이 선택되지 않았습니다.',
        });
      }
      if (data.period === 'etc') {
        const numberValue = Number(data.periodNumber);
        if (
          !data.periodNumber ||
          !isWholeNumberString(data.periodNumber) ||
          isNaN(numberValue) ||
          !Number.isInteger(numberValue) ||
          numberValue < 7 ||
          numberValue > 730
        ) {
          ctx.addIssue({
            path: ['periodNumber'],
            code: z.ZodIssueCode.custom,
            message: '7일부터 730일 사이의 숫자를 입력해주세요.',
          });
        }
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
      if (data.memberCount === 'etc') {
        const numberValue = Number(data.memberCountNumber);
        if (
          !data.memberCountNumber ||
          !isWholeNumberString(data.memberCountNumber) ||
          isNaN(numberValue) ||
          !Number.isInteger(numberValue) ||
          numberValue < 2 ||
          numberValue > 100
        ) {
          ctx.addIssue({
            path: ['memberCountNumber'],
            code: z.ZodIssueCode.custom,
            message:
              '2명부터 100명 사이의 숫자를 입력해주세요. 그 이상은 제한 없음을 선택해주세요.',
          });
        }
      }
    }
    if (data.goals.length === 0) {
      ctx.addIssue({
        path: ['goals'],
        code: z.ZodIssueCode.custom,
        message: '목표를 하나 이상 입력해주세요.',
      });
    }
    if (data.challengeType === 'PRIVATE') {
      const password = data.password?.trim() ?? '';
      if (password.length < 4 || password.length > 20) {
        ctx.addIssue({
          path: ['password'],
          code: z.ZodIssueCode.custom,
          message: '비밀번호는 4자 이상 20자 이하로 입력해주세요.',
        });
      }
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
      // 챌린지 시작 후에도 다른 사용자들이 자유롭게 합류할 수 있도록 기본값을
      // 허용으로 둔다. 작성자는 필요 시 토글로 비허용으로 바꿀 수 있다.
      allowMidJoin: true,
      isPhotoRequired: false,
      postEndWriteAllowed: false,
      challengeType: 'PUBLIC',
      password: '',
      goals: [],
    },
  });

  return form;
}
