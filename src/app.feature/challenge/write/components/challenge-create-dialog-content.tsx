import { Text, Tag } from '@1d1s/design-system';
import { ChallengeGoalToggle } from '@feature/challenge/detail/components/challenge-goal-toggle';
import { useFormContext } from 'react-hook-form';
import { ChallengeCreateFormValues } from '../hooks/use-challenge-create-form';
import { CATEGORY_OPTIONS } from '@constants/categories';
import { format } from 'date-fns';

/**
 * ChallengeCreateDialogContent
 * 챌린지 생성 다이얼로그의 내용 컴포넌트
 */
export function ChallengeCreateDialogContent(): React.ReactElement {
  const { getValues } = useFormContext<ChallengeCreateFormValues>();
  const values = getValues();
  const category = CATEGORY_OPTIONS.find((option) => option.value === values.category);

  return (
    <div className="flex flex-col gap-6">
      {/* 챌린지 제목과 설명 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Text size="heading1" weight="bold" className="text-black">
            {values.title}
          </Text>
          {category && <Tag icon={category.icon}>{category.label}</Tag>}
        </div>
        <div className="bg-main-300 rounded-odos-2 p-6">
          <Text size="body2" weight="regular" className="text-black">
            {values.description}
          </Text>
        </div>
      </div>

      {/* 챌린지 기간 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Text size="heading2" weight="bold" className="text-black">
            챌린지 기간
          </Text>
          <Tag>{values.periodType === 'ENDLESS' ? '무한 기간' : '유한 기간'}</Tag>
        </div>
        {values.periodType === 'LIMITED' && (
          <>
            <Text size="body2" weight="medium" className="text-black">
              {values.period !== 'etc' ? values.period! : values.periodNumber!}일
            </Text>
            <Text size="body2" weight="medium" className="text-black">
              {format(values.startDate!, 'yyyy-MM-dd')} 시작
            </Text>
          </>
        )}
      </div>

      {/* 챌린지 인원 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Text size="heading2" weight="bold" className="text-black">
            챌린지 인원
          </Text>
          <Tag>
            {values.participationType === 'INDIVIDUAL' ? '개인 챌린지' : '단체 챌린지'}
          </Tag>
        </div>
        {values.participationType === 'GROUP' && (
          <Text size="body2" weight="medium" className="text-black">
            {values.memberCount !== 'etc' ? values.memberCount! : values.memberCountNumber!}명
          </Text>
        )}
      </div>

      {/* 챌린지 목표 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Text size="heading2" weight="bold" className="text-black">
            챌린지 목표
          </Text>
          <Tag>{values.goalType === 'FIXED' ? '고정 목표' : '자유 목표'}</Tag>
        </div>
        <div className="flex flex-col gap-0.5">
          {values.goals.map((goal, index) => (
            <ChallengeGoalToggle key={index} checked={true} label={goal.value} />
          ))}
        </div>
      </div>
    </div>
  );
}
