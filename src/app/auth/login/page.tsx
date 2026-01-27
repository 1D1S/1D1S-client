'use client';

import { HeroText } from '@/features/auth/presentation/components/hero-text';
import { LoginButtons } from '@/features/auth/presentation/components/login-buttons';
import RollingText from '@/features/auth/presentation/components/rolling-text';
import { PageTitle, Spacing } from '@1d1s/design-system';

export default function LoginPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex w-full flex-col px-4">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="로그인" />
        </div>

        <Spacing className="h-12" />
        <div className="flex flex-col items-center justify-center">
          <HeroText className="text-black">소셜 로그인으로</HeroText>
          <Spacing className="h-8" />
          <div className="flex flex-wrap justify-center">
            <HeroText className="text-main-800">1분 </HeroText>
            <HeroText className="text-black">만에 회원가입하고</HeroText>
          </div>
          <Spacing className="h-6" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <RollingText />
            <HeroText className="text-black">챌린지 참여하자!</HeroText>
          </div>
        </div>

        <Spacing className="h-12" />
        <LoginButtons />
      </div>
    </div>
  );
}
