import { ChallengeCreateFormValues } from '@feature/challenge/write/hooks/use-challenge-create-form';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function getFieldsByStep(
  step: number
): Array<keyof ChallengeCreateFormValues> {
  switch (step) {
    case 1:
      return ['title', 'category'];
    case 2:
      return ['participationType', 'memberCount', 'memberCountNumber'];
    case 3:
      return ['goalType', 'goals'];
    case 4:
      return ['periodType', 'period', 'periodNumber', 'startDate'];
    default:
      return [];
  }
}

export function useStepValidation(step: number): boolean {
  const { trigger, watch } = useFormContext<ChallengeCreateFormValues>();
  const [isValid, setIsValid] = useState(false);

  const fields = useMemo(() => getFieldsByStep(step), [step]);

  const watchedValues = watch(fields);
  const stringifiedWatchedValues = JSON.stringify(watchedValues);

  useEffect(() => {
    const validate = async (): Promise<void> => {
      const result = await trigger(fields);
      setIsValid(result);
    };
    validate();
  }, [trigger, stringifiedWatchedValues, fields]);

  return isValid;
}
