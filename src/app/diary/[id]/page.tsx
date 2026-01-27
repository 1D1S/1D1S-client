import { ChallengeGoalToggle } from '@/features/diary/presentation/components/challenge-goal-toggle';
import { DiaryContentField } from '@/features/diary/presentation/components/diary-content-field';
import {
  ChallengeListItem,
  Footer,
  Text,
  PageTitle,
  PageWatermark,
  Spacing,
  Tag,
} from '@1d1s/design-system';

export const revalidate = 60;

interface DiaryDetailProps {
  params: Promise<{ id: string }>;
}

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

async function getDiaryData(id: string): Promise<DiaryData> {
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
    <div className="flex w-full flex-col gap-2">
      <Text size="display2" weight="bold">
        {title}
      </Text>
      <div className="flex gap-2">
        <Text size="caption2" weight="bold">
          {author}
        </Text>
        <Text size="caption2" weight="bold" className="text-gray-500">
          {createdAt}
        </Text>
      </div>
    </div>
  );
}

function ChallengeGoalsSection({
  goals,
}: {
  goals: Array<{ id: string; label: string; completed: boolean }>;
}): React.ReactElement {
  return (
    <>
      <Text size="heading2" weight="bold">
        챌린지
      </Text>
      <ChallengeListItem
        challengeName={'챌린지'}
        startDate={'2025-06-28'}
        endDate={'2025-07-28'}
        maxParticipants={10}
        currentParticipants={5}
      />
      <Spacing className="h-6" />
      <div className="flex gap-2">
        <Text size="heading2" weight="bold">
          챌린지 목표
        </Text>
        <Tag>고정목표</Tag>
      </div>

      <div className="mt-4 flex flex-col space-y-3">
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

export default async function DiaryDetail({
  params,
}: DiaryDetailProps): Promise<React.ReactElement> {
  const { id } = await params;
  const diaryData = await getDiaryData(id);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex w-full flex-col px-4">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="일지 상세" />
        </div>

        <div className="flex w-full flex-col">
          <Spacing className="h-8" />

          <DiaryHeader
            title={diaryData.title}
            author={diaryData.author}
            createdAt={diaryData.createdAt}
          />

          <Spacing className="h-6" />

          <ChallengeGoalsSection goals={diaryData.challengeGoals} />

          <Spacing className="h-6" />

          <DiaryContentField
            value={diaryData.content}
            editable={false}
            imageSrc={diaryData.imageSrc}
          />
        </div>

        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageWatermark />
        </div>
        <Spacing className="h-8" />
      </div>

      <Footer />
    </div>
  );
}
