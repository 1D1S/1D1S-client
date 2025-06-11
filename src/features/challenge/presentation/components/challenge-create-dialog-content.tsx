import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosTag } from '@/shared/components/odos-ui/tag';
import { ChallengeGoalToggle } from './challenge-goal-toggle';

/**
 * ChallengeCreateDialogContent
 * 챌린지 생성 다이얼로그의 내용 컴포넌트
 */
export function ChallengeCreateDialogContent(): React.ReactElement {
  return (
    <div className="flex flex-col gap-6">
      {/* 챌린지 제목과 설명 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <OdosLabel size="heading1" weight="bold" className="text-black">
            챌린지 제목
          </OdosLabel>
          <OdosTag icon="💻">태그 예시</OdosTag>
        </div>
        <div className="bg-main-300 rounded-odos-2 p-6">
          <OdosLabel size="body2" weight="regular" className="text-black">
            챌린지 설명이 여기에 들어갑니다. 이 챌린지는 여러분의 목표를 달성하는 데 도움을 줄
            것입니다.
          </OdosLabel>
        </div>
      </div>

      {/* 챌린지 기간 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <OdosLabel size="heading2" weight="bold" className="text-black">
            챌린지 기간
          </OdosLabel>
          <OdosTag>유한 기간</OdosTag>
        </div>
        <OdosLabel size="body2" weight="medium" className="text-black">
          24일
        </OdosLabel>
        <OdosLabel size="body2" weight="medium" className="text-black">
          2025-04-30 시작
        </OdosLabel>
      </div>

      {/* 챌린지 인원 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <OdosLabel size="heading2" weight="bold" className="text-black">
            챌린지 인원
          </OdosLabel>
          <OdosTag>단체 챌린지</OdosTag>
        </div>
        <OdosLabel size="body2" weight="medium" className="text-black">
          42명
        </OdosLabel>
      </div>

      {/* 챌린지 목표 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <OdosLabel size="heading2" weight="bold" className="text-black">
            챌린지 목표
          </OdosLabel>
          <OdosTag>고정 목표</OdosTag>
        </div>
        <div className="flex flex-col gap-0.5">
          <ChallengeGoalToggle checked={true} label="챌린지 목표 1" />
          <ChallengeGoalToggle checked={true} label="챌린지 목표 2" />
          <ChallengeGoalToggle checked={true} label="챌린지 목표 3" />
        </div>
      </div>
    </div>
  );
}
