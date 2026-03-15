import { CATEGORY_OPTIONS } from '@constants/categories';

import type { SignupFormValues, SignupTopic } from '../hooks/use-sign-up-form';

export type SignUpGenderValue = Exclude<SignupFormValues['gender'], undefined>;
export type SignUpJobValue = Exclude<SignupFormValues['job'], undefined>;

export const SIGN_UP_GENDER_OPTIONS: Array<{
  value: SignUpGenderValue;
  label: string;
}> = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
  { value: 'ETC', label: '기타' },
];

export const SIGN_UP_OCCUPATION_OPTIONS: Array<{
  value: SignUpJobValue;
  label: string;
}> = [
  { value: 'STUDENT', label: '학생' },
  { value: 'WORKER', label: '직장인' },
];

export const SIGN_UP_TOPIC_OPTIONS: Array<{
  value: SignupTopic;
  label: string;
  icon: string;
}> = CATEGORY_OPTIONS.map((option) => ({
  value: option.value as SignupTopic,
  label: option.label,
  icon: option.icon,
}));
