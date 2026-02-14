'use client';

// import { Button } from '@/components/odos-ui/button';
import {
  Text,
  SelectSeparator,
  Select,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectContent,
  SelectValue,
  Toggle,
  TextField,
} from '@1d1s/design-system';
// import { Tag } from '@/components/odos-ui/tag';
// import { ChallengeCard } from '@/shared/components/odos-ui/challenge-card';

export default function DevTest(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-24">
      <h1 className="font-suite text-2xl font-bold">Dev Test 수트</h1>
      <p className="text-main-700 font-pretendard">This is a test page for development purposes.</p>
      <p className="text-main-700">This is a test page for development purposes.</p>

      {/* Labels */}
      <Text size="heading1" weight={'bold'}>
        This is a test page for development purposes.
      </Text>
      <Text size="body2" weight="regular">
        This is a test page for development purposes.
      </Text>
      <Text size="pageTitle" weight="regular">
        This is a test page for development purposes.
      </Text>

      {/* Page Title */}
      <Text size="display1" weight="bold">
        페이지 타이틀
      </Text>
      <div className="flex flex-col items-center gap-1">
        <Text size="display1" weight="bold">
          페이지 타이틀
        </Text>
        <Text size="body1" weight="medium" className="text-gray-600">
          페이지 타이틀
        </Text>
      </div>

      {/* Buttons */}
      {/*
      <Button variant={'default'}>Default Button</Button>
      <Button variant={'disalbed'}>Disabled Button</Button>
      <Button variant={'warning'}>Wanring Button</Button>
      <Button variant={'loading'}>Loading Button</Button>
      <Button variant={'outline'}>Outline Button</Button>
      <Button variant={'defaultSmall'}>Default Button</Button>
      <Button variant={'disalbedSmall'}>Disabled Button</Button>
      <Button variant={'warningSmall'}>Wanring Button</Button>
      <Button variant={'loadingSmall'}>Loading Button</Button>
      <Button variant={'outlineSmall'}>Outline Button</Button>*/}

      {/* Tags */}
      {/* 
      <Tag icon="⭐" weight="medium">
        This is a tag
      </Tag>
      <Tag weight="bold">This is a tag</Tag>*/}

      {/*Challenge Card */}
      {/*<ChallengeCard
        challengeTitle="챌린지 제목"
        challengeType="고정목표형"
        currentUserCount={12}
        maxUserCount={20}
        startDate="2023-10-01"
        endDate="2023-10-31"
        isOngoing={true}
      />
      <ChallengeCard
        challengeTitle="챌린지 제목"
        challengeType="고정목표형"
        currentUserCount={12}
        maxUserCount={20}
        startDate="2023-10-01"
        endDate="2023-10-31"
        isOngoing={false}
      />*/}
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="값을 선택해주세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectSeparator />
            <SelectItem value="option3">Option 3</SelectItem>
            <SelectItem value="option4">Option 4</SelectItem>
            <SelectItem value="option5">Option 5</SelectItem>
            <SelectItem value="option6">Option 6</SelectItem>

            <SelectItem value="option7">직접 입력 (최대 50명)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Toggle>토글 태그</Toggle>
      <Toggle icon="💻">개발 태그</Toggle>
      <TextField placeholder="텍스트 필드" />
      <TextField label="라벨" placeholder="텍스트 필드" />
      <TextField
        label="에러 메시지가 있는 텍스트 필드"
        placeholder="텍스트 필드"
        error="이 필드는 필수입니다."
      />
    </div>
  );
}
