import { ChallengeGoalToggle } from '@/features/diary/presentation/components/challenge-goal-toggle';
import { DiaryContentField } from '@/features/diary/presentation/components/diary-content-field';
import { ChallengeListItem } from '@/shared/components/odos-ui/challenge-list-item';
import { OdosFooter } from '@/shared/components/odos-ui/footer';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosPageWatermark } from '@/shared/components/odos-ui/page-watermark';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosTag } from '@/shared/components/odos-ui/tag';
import { SsgoiTransition } from '@ssgoi/react';

export const revalidate = 60;

interface DiaryDetailProps {
  params: Promise<{ id: string }>;
}

// 더미 데이터 - 실제로는 API나 데이터베이스에서 가져와야 함
interface DiaryData {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  content: string;
  imageSrc?: string;
  challengeGoals: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
}

// 실제 구현에서는 데이터베이스나 API에서 데이터를 가져오는 함수
async function getDiaryData(id: string): Promise<DiaryData> {
  // TODO: 실제 데이터 fetching 로직 구현
  return {
    id,
    title: `일지 제목 ${id}`,
    author: '작성자 이름',
    createdAt: '2025-04-07',
    content: '123131312312313123123123',
    imageSrc: 'https://picsum.photos/200/300',
    challengeGoals: [
      { id: '1', label: '챌린지 목표 1', completed: true },
      { id: '2', label: '챌린지 목표 2', completed: true },
    ],
  };
}

// 헤더 섹션 컴포넌트
function DiaryHeader({
  title,
  author,
  createdAt,
}: {
  title: string;
  author: string;
  createdAt: string;
}): React.ReactElement {
  return (
    <div className="flex w-full justify-between">
      <OdosLabel size="display2" weight="bold">
        {title}
      </OdosLabel>
      <div className="flex flex-col items-end gap-1">
        <OdosLabel size="caption2" weight="bold">
          {author}
        </OdosLabel>
        <OdosLabel size="caption2" weight="bold">
          {createdAt}
        </OdosLabel>
      </div>
    </div>
  );
}

// 챌린지 목표 섹션 컴포넌트
function ChallengeGoalsSection({
  goals,
}: {
  goals: Array<{ id: string; label: string; completed: boolean }>;
}): React.ReactElement {
  return (
    <>
      <OdosLabel size="heading2" weight="bold">
        챌린지
      </OdosLabel>
      <ChallengeListItem
        challengeName={'챌린지'}
        startDate={'2025-06-28'}
        endDate={'2025-07-28'}
        maxParticipants={10}
        currentParticipants={5}
      />
      <OdosSpacing className="h-10" />
      <div className="flex gap-2">
        <OdosLabel size="heading2" weight="bold">
          챌린지 목표
        </OdosLabel>
        <OdosTag>고정목표</OdosTag>
      </div>

      <div className="mt-6 flex flex-col space-y-3">
        {goals.map((goal, index) => (
          <ChallengeGoalToggle
            key={goal.id}
            disabled={true}
            checked={goal.completed}
            label={goal.label}
            className={index === 0 ? '' : 'mt-3'}
          />
        ))}
      </div>
    </>
  );
}

// 메인 컴포넌트
export default async function DiaryDetail({
  params,
}: DiaryDetailProps): Promise<React.ReactElement> {
  const { id } = await params;
  const diaryData = await getDiaryData(id);

  return (
    <SsgoiTransition id={`/diary/${id}`}>
      <div className="flex flex-col">
        <div className="flex justify-center">
          <OdosPageBackground className="min-h-screen max-w-250 px-7.5">
            <OdosSpacing className="h-20" />
            <OdosPageTitle title="일지 상세" />

            <div className="flex w-full flex-col self-start">
              <OdosSpacing className="h-17.5" />

              <DiaryHeader
                title={diaryData.title}
                author={diaryData.author}
                createdAt={diaryData.createdAt}
              />

              <OdosSpacing className="h-10" />

              <ChallengeGoalsSection goals={diaryData.challengeGoals} />

              <OdosSpacing className="h-10" />

              <DiaryContentField
                value={diaryData.content}
                editable={false}
                imageSrc={diaryData.imageSrc}
              />
            </div>

            <OdosSpacing className="h-10" />
            <OdosPageWatermark />
            <OdosSpacing className="h-10" />
          </OdosPageBackground>
        </div>
        <OdosFooter />
      </div>
    </SsgoiTransition>
  );
}
