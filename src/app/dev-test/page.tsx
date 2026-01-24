// import { OdosButton } from '@/components/odos-ui/button';
import {
  Text as OdosLabel,
  PageTitle as OdosPageTitle,
  SelectSeparator as OdosSelectSeparator,
  Select as OdosSelect,
  SelectItem as OdosSelectItem,
  SelectGroup as OdosSelectGroup,
  SelectTrigger as OdosSelectTrigger,
  SelectContent as OdosSelectContent,
  SelectValue as OdosSelectValue,
  Toggle as OdosToggle,
  TextField as OdosTextField,
} from '@1d1s/design-system';
// import { OdosTag } from '@/components/odos-ui/tag';
// import { OdosChallengeCard } from '@/shared/components/odos-ui/challenge-card';

export default function DevTest(): React.ReactElement {
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
      {/*<OdosChallengeCard
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
      />*/}
      <OdosSelect>
        <OdosSelectTrigger className="w-[180px]">
          <OdosSelectValue placeholder="값을 선택해주세요" />
        </OdosSelectTrigger>
        <OdosSelectContent>
          <OdosSelectGroup>
            <OdosSelectItem value="option1">Option 1</OdosSelectItem>
            <OdosSelectItem value="option2">Option 2</OdosSelectItem>
            <OdosSelectSeparator />
            <OdosSelectItem value="option3">Option 3</OdosSelectItem>
            <OdosSelectItem value="option4">Option 4</OdosSelectItem>
            <OdosSelectItem value="option5">Option 5</OdosSelectItem>
            <OdosSelectItem value="option6">Option 6</OdosSelectItem>

            <OdosSelectItem value="option7">직접 입력 (최대 50명)</OdosSelectItem>
          </OdosSelectGroup>
        </OdosSelectContent>
      </OdosSelect>

      <OdosToggle>토글 태그</OdosToggle>
      <OdosToggle icon="💻">개발 태그</OdosToggle>
      <OdosTextField placeholder="텍스트 필드" />
      <OdosTextField label="라벨" placeholder="텍스트 필드" />
      <OdosTextField
        label="에러 메시지가 있는 텍스트 필드"
        placeholder="텍스트 필드"
        error="이 필드는 필수입니다."
      />
    </div>
  );
}
