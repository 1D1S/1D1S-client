import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosChallengeCard } from '@/shared/components/odos-ui/challenge-card';
import { OdosFooter } from '@/shared/components/odos-ui/footer';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosPageWatermark } from '@/shared/components/odos-ui/page-watermark';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';
import { OdosMenu } from '@/shared/components/odos-ui/menu';
import { OdosProfileCard } from '@/shared/components/odos-ui/profile-card';

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): React.ReactElement {
  return (
    <div className="ml-6 flex w-full flex-col gap-4">
      <div className="flex flex-row gap-2.5">
        <OdosLabel size="heading1" weight="bold" className="text-black">
          {title}
        </OdosLabel>
        <OdosLabel size="body2" weight="medium" className="text-gray-500">
          더보기 +
        </OdosLabel>
      </div>
      <OdosLabel size="caption3" weight="medium" className="text-gray-600">
        {subtitle}
      </OdosLabel>
    </div>
  );
}

export default function MainPage(): React.ReactElement {
  return (
    <div className="flex w-full flex-col">
      {/* 왼쪽 고정 메뉴 */}
      <div className="fixed top-4 left-4 z-50 h-full w-60">
        <OdosMenu />
      </div>
      <div className="fixed top-4 right-4 z-50 h-full">
        <OdosProfileCard />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex w-full flex-col justify-center">
        <OdosPageBackground className="mx-auto w-250">
          <OdosSpacing className="h-20" />
          <OdosPageTitle title="1D1S" variant="noSubtitle" />

          <OdosSpacing className="h-25" />

          <SectionHeader title="랜덤 챌린지" subtitle="챌린지에 참여하고 목표를 달성해봐요." />
          <OdosSpacing className="h-2" />
          <ScrollArea className="h-68 w-full">
            <div className="flex h-65 flex-row items-center gap-6">
              {/* 카드 여러 개 */}
              {[...Array(8)].map((_, i) => (
                <OdosChallengeCard
                  key={i}
                  challengeTitle="챌린지 제목"
                  challengeType="고정목표형"
                  currentUserCount={12}
                  maxUserCount={20}
                  startDate="2023-10-01"
                  endDate="2023-10-31"
                  isOngoing={i === 0}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <OdosSpacing className="h-21" />
          <SectionHeader title="랜덤 일지" subtitle="챌린저들의 일지를 보며 의욕을 충전해봐요." />
          <OdosSpacing className="h-20" />
          <OdosPageWatermark />
          <OdosSpacing className="h-20" />
        </OdosPageBackground>
        <div className="w-full">
          <OdosFooter />
        </div>
      </div>
      {/* 푸터는 메뉴 외부에서 고정 */}
    </div>
  );
}
