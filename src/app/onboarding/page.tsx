'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Text, Button } from '@1d1s/design-system';

function OnboardingSection({
  title,
  description,
  imageSrc,
  reverse = false,
}: {
  title: string;
  description: string;
  imageSrc?: string;
  reverse?: boolean;
}): React.ReactElement {
  return (
    <div
      className={`flex w-full flex-col items-center gap-6 py-10 ${reverse ? 'bg-gray-50' : 'bg-white'}`}
    >
      <div className="flex flex-col items-center px-6 text-center">
        <Text size="heading1" weight="bold" className="text-main-900 mb-2">
          {title}
        </Text>
        <Text size="body1" weight="medium" className="whitespace-pre-line text-gray-600">
          {description}
        </Text>
      </div>
      {imageSrc ? (
        <div className="relative h-60 w-60 overflow-hidden rounded-2xl shadow-lg">
          <Image src={imageSrc} alt={title} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-60 w-60 items-center justify-center rounded-2xl bg-gray-200 text-gray-400">
          이미지 준비중
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col bg-white pt-16">
      <div className="flex w-full justify-center">
        <Text size="display1" weight="bold" className="text-gray-900">
          1D1S 소개
        </Text>
      </div>

      <div className="h-4" />

      <div className="flex flex-col">
        <OnboardingSection
          title="매일 하나의 챌린지"
          description={'지루한 일상에 활력을 불어넣어보세요.매일 새로운 목표에 도전할 수 있습니다.'}
          imageSrc="/images/logo.png"
        />

        <OnboardingSection
          title="일지로 기록하기"
          description={'오늘의 도전과 감정을 일지로 남겨보세요.나만의 소중한 기록이 됩니다.'}
          reverse
        />

        <OnboardingSection
          title="함께 성장하기"
          description={'다른 사람들과 챌린지를 공유하며 함께 성장하는 즐거움을 느껴보세요.'}
        />
      </div>

      <div className="px-6 py-10">
        <Button
          variant="default"
          className="h-14 w-full text-base"
          onClick={() => router.push('/challenge')}
        >
          챌린지 시작하기
        </Button>
      </div>
    </div>
  );
}
