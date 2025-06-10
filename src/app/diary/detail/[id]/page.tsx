import { ChallengeGoalToggle } from '@/features/diary/presentation/components/challenge-goal-toggle';
import { DiaryContentField } from '@/features/diary/presentation/components/diary-content-field';
import { OdosFooter } from '@/shared/components/odos-ui/footer';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosPageWatermark } from '@/shared/components/odos-ui/page-watermark';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosTag } from '@/shared/components/odos-ui/tag';

interface DiaryDetailProps {
  params: { id: string };
}

export default function DiaryDetail({ params: { id } }: DiaryDetailProps & {}): React.ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <OdosPageBackground className="min-h-screen max-w-250 px-7.5">
          <OdosSpacing className="h-20" />
          <OdosPageTitle title={'일지 상세'}></OdosPageTitle>
          <div className="flex w-full flex-col self-start">
            <OdosSpacing className="h-17.5" />
            <div className="flex w-full justify-between">
              <OdosLabel size={'display2'} weight={'bold'}>
                일지 제목 {id}
              </OdosLabel>
              <div className="justfy-end flex flex-col items-end gap-1">
                <OdosLabel size={'caption2'} weight={'bold'}>
                  작성자 이름
                </OdosLabel>
                <OdosLabel size={'caption2'} weight={'bold'}>
                  2025-04-07
                </OdosLabel>
              </div>
            </div>

            <OdosSpacing className="h-10" />
            <OdosLabel size={'heading2'} weight={'bold'}>
              챌린지
            </OdosLabel>

            <OdosSpacing className="h-10" />
            <div className="flex gap-2">
              <OdosLabel size={'heading2'} weight={'bold'}>
                챌린지 목표
              </OdosLabel>
              <OdosTag>고정목표</OdosTag>
            </div>
            <ChallengeGoalToggle
              disabled={true}
              checked={true}
              label={'챌린지 목표 1'}
              className="mt-6"
            />
            <ChallengeGoalToggle
              disabled={true}
              checked={true}
              label={'챌린지 목표 1'}
              className="mt-3"
            />
            <OdosSpacing className="h-10" />
            <DiaryContentField
              value={'123131312312313123123123'}
              editable={false}
              imageSrc="https://picsum.photos/200/300"
            />
          </div>
          <OdosSpacing className="h-10" />
          <OdosPageWatermark />
          <OdosSpacing className="h-10" />
        </OdosPageBackground>
      </div>
      <OdosFooter></OdosFooter>
    </div>
  );
}
