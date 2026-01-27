'use client';

import { LoginButtons } from '@/features/auth/presentation/components/login-buttons';
import { PageTitle, Spacing, Text } from '@1d1s/design-system';

export default function LoginPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex w-full flex-col px-4 pt-16">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="로그인" />
        </div>

        <Spacing className="h-20" />
        <div className="flex flex-col items-center justify-center text-center">
          <Text size="heading1" weight="bold" className="text-black">
            소셜 로그인으로
          </Text>
          <Spacing className="h-2" />
          <Text size="heading1" weight="bold" className="text-black">
            1분만에 회원가입하고
          </Text>
          <Spacing className="h-2" />
          <Text size="heading1" weight="bold" className="text-black">
            챌린지 참여하자!
          </Text>
        </div>

        <Spacing className="h-20" />
        <LoginButtons />
      </div>
    </div>
  );
}