import { Text as OdosLabel, Tag as OdosTag } from '@1d1s/design-system';
import { ChallengeGoalToggle } from './challenge-goal-toggle';
import { useFormContext } from 'react-hook-form';
import { ChallengeCreateFormValues } from '../hooks/use-challenge-create-form';
import { CATEGORY_OPTIONS } from '@/shared/constants/categories';
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
          <OdosLabel size="heading1" weight="bold" className="text-black">
            {values.title}
          </OdosLabel>
          {category && <OdosTag icon={category.icon}>{category.label}</OdosTag>}
        </div>
        <div className="bg-main-300 rounded-odos-2 p-6">
          <OdosLabel size="body2" weight="regular" className="text-black">
            {values.description}
          </OdosLabel>
        </div>
      </div>

      {/* 챌린지 기간 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <OdosLabel size="heading2" weight="bold" className="text-black">
            챌린지 기간
          </OdosLabel>
          <OdosTag>{values.periodType === 'ENDLESS' ? '무한 기간' : '유한 기간'}</OdosTag>
        </div>
        {values.periodType === 'LIMITED' && (
          <>
            <OdosLabel size="body2" weight="medium" className="text-black">
              {values.period !== 'etc' ? values.period! : values.periodNumber!}일
            </OdosLabel>
            <OdosLabel size="body2" weight="medium" className="text-black">
              {format(values.startDate!, 'yyyy-MM-dd')} 시작
            </OdosLabel>
          </>
        )}
      </div>

      {/* 챌린지 인원 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <OdosLabel size="heading2" weight="bold" className="text-black">
            챌린지 인원
          </OdosLabel>
          <OdosTag>
            {values.participationType === 'INDIVIDUAL' ? '개인 챌린지' : '단체 챌린지'}
          </OdosTag>
        </div>
        {values.participationType === 'GROUP' && (
          <OdosLabel size="body2" weight="medium" className="text-black">
            {values.memberCount !== 'etc' ? values.memberCount! : values.memberCountNumber!}명
          </OdosLabel>
        )}
      </div>

      {/* 챌린지 목표 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <OdosLabel size="heading2" weight="bold" className="text-black">
            챌린지 목표
          </OdosLabel>
          <OdosTag>{values.goalType === 'FIXED' ? '고정 목표' : '자유 목표'}</OdosTag>
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
