'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import type {
  ChallengeCategory,
  GoalType,
  ParticipationType,
} from '../../board/type/challenge';

function isWholeNumberString(value?: string): boolean {
  return Boolean(value && /^\d+$/.test(value));
}

export const challengeEditFormSchema = z
  .object({
    title: z
      .string()
      .min(1, '챌린지 제목을 입력해주세요.')
      .max(50, '챌린지 제목은 50자 이하로 입력해주세요.'),
    category: z.enum(
      [
        'DEV',
        'EXERCISE',
        'BOOK',
        'DIET',
        'HEALTH',
        'HOBBY',
        'LANGUAGE',
        'SELF_DEV',
        'ETC',
      ],
      {
        message: '카테고리를 선택해주세요.',
      }
    ),
    description: z
      .string()
      .max(200, '챌린지 설명은 200자 이하로 입력해주세요.')
      .optional(),
    memberCount: z.enum(['2', '5', '10', 'etc', 'unlimited']).optional(),
    memberCountNumber: z.string().optional(),
    allowMidJoin: z.boolean(),
    thumbnailImageKey: z.string().optional(),
    thumbnailPreviewUrl: z.string().optional(),
    thumbnailRemoved: z.boolean(),
    goals: z.array(
      z.object({
        value: z
          .string()
          .min(1, '목표를 입력해주세요.')
          .max(100, '목표는 100자 이하로 입력해주세요.'),
      })
    ),
    isGroup: z.boolean(),
    isFixedGoal: z.boolean(),
    isStarted: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.isGroup && !data.isStarted) {
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
          Number.isNaN(numberValue) ||
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
    if (data.isFixedGoal && !data.isStarted && data.goals.length === 0) {
      ctx.addIssue({
        path: ['goals'],
        code: z.ZodIssueCode.custom,
        message: '목표를 하나 이상 입력해주세요.',
      });
    }
  });

export type ChallengeEditFormValues = z.infer<typeof challengeEditFormSchema>;

export type EditableChallengeCategory = Exclude<ChallengeCategory, 'ALL'>;

export interface ChallengeEditFormDefaults {
  title: string;
  category: EditableChallengeCategory;
  description: string;
  memberCount?: ChallengeEditFormValues['memberCount'];
  memberCountNumber?: string;
  allowMidJoin: boolean;
  thumbnailImageKey?: string;
  thumbnailPreviewUrl?: string;
  goals: string[];
  participationType: ParticipationType;
  goalType: GoalType;
  isStarted: boolean;
}

export function useChallengeEditForm(
  defaults: ChallengeEditFormDefaults
): UseFormReturn<ChallengeEditFormValues> {
  return useForm<ChallengeEditFormValues>({
    shouldUnregister: false,
    mode: 'onChange',
    resolver: zodResolver(challengeEditFormSchema),
    defaultValues: {
      title: defaults.title,
      category: defaults.category,
      description: defaults.description,
      memberCount: defaults.memberCount,
      memberCountNumber: defaults.memberCountNumber ?? '',
      allowMidJoin: defaults.allowMidJoin,
      thumbnailImageKey: defaults.thumbnailImageKey,
      thumbnailPreviewUrl: defaults.thumbnailPreviewUrl,
      thumbnailRemoved: false,
      goals: defaults.goals.map((value) => ({ value })),
      isGroup: defaults.participationType === 'GROUP',
      isFixedGoal: defaults.goalType === 'FIXED',
      isStarted: defaults.isStarted,
    },
  });
}
