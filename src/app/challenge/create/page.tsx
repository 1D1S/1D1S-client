// import { OdosButton } from '@/components/odos-ui/button';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
// import { OdosTag } from '@/components/odos-ui/tag';
import { OdosChallengeCard } from '@/shared/components/odos-ui/challenge-card';

export default function ChallengeCreate(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-24">
      <h1 className="font-suite text-2xl font-bold">Dev Test 수트</h1>
      <p className="text-main-700 font-pretendard">This is a test page for development purposes.</p>
      <p className="text-main-700">This is a test page for development purposes.</p>

      {/* Labels */}
      <OdosLabel size="heading1" weight={'bold'}>
        This is a test page for development purposes.
      </OdosLabel>
      <OdosLabel size="body2" weight="regular">
        This is a test page for development purposes.
      </OdosLabel>
      <OdosLabel size="pageTitle" weight="regular">
        This is a test page for development purposes.
      </OdosLabel>

      {/* Page Title */}
      <OdosPageTitle title="페이지 타이틀" variant="noSubtitle" />
      <OdosPageTitle title="페이지 타이틀" variant="withSubtitle" subtitle="페이지 타이틀" />

      {/* Buttons */}
      {/*
      <OdosButton variant={'default'}>Default OdosButton</OdosButton>
      <OdosButton variant={'disalbed'}>Disabled OdosButton</OdosButton>
      <OdosButton variant={'warning'}>Wanring OdosButton</OdosButton>
      <OdosButton variant={'loading'}>Loading OdosButton</OdosButton>
      <OdosButton variant={'outline'}>Outline OdosButton</OdosButton>
      <OdosButton variant={'defaultSmall'}>Default OdosButton</OdosButton>
      <OdosButton variant={'disalbedSmall'}>Disabled OdosButton</OdosButton>
      <OdosButton variant={'warningSmall'}>Wanring OdosButton</OdosButton>
      <OdosButton variant={'loadingSmall'}>Loading OdosButton</OdosButton>
      <OdosButton variant={'outlineSmall'}>Outline OdosButton</OdosButton>*/}

      {/* Tags */}
      {/* 
      <OdosTag icon="⭐" weight="medium">
        This is a tag
      </OdosTag>
      <OdosTag weight="bold">This is a tag</OdosTag>*/}

      {/*Challenge Card */}
      <OdosChallengeCard
        challengeTitle="챌린지 제목"
        challengeType="고정목표형"
        currentUserCount={12}
        maxUserCount={20}
        startDate="2023-10-01"
        endDate="2023-10-31"
        isOngoing={true}
      />
      <OdosChallengeCard
        challengeTitle="챌린지 제목"
        challengeType="고정목표형"
        currentUserCount={12}
        maxUserCount={20}
        startDate="2023-10-01"
        endDate="2023-10-31"
        isOngoing={false}
      />
    </div>
  );
}
