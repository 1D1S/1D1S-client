'use client';
import { HeroText } from '@/features/auth/presentation/components/hero-text';
import { LoginButtons } from '@/features/auth/presentation/components/login-buttons';
import RollingText from '@/features/auth/presentation/components/rolling-text';
import {
  PageBackground as OdosPageBackground,
  PageTitle as OdosPageTitle,
  Spacing as OdosSpacing,
} from '@1d1s/design-system';

export default function LoginPage(): React.ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <OdosPageBackground className="min-h-screen min-w-150 px-6">
          <OdosSpacing className="h-20" />
          <OdosPageTitle title="로그인" />

          <OdosSpacing className="h-25" />
          <div className="flex flex-col items-center justify-center">
            <HeroText className="text-black">소셜 로그인으로</HeroText>
            <OdosSpacing className="h-25" />
            <div>
              <HeroText className="text-main-800">1분 </HeroText>
              <HeroText className="text-black">만에 회원가입하고</HeroText>
            </div>
            <OdosSpacing className="h-12" />
            <div className="flex items-center gap-2">
              <RollingText />
              <HeroText className="text-black">챌린지 참여하자!</HeroText>
              <OdosSpacing className="w-10" />
            </div>
          </div>

          <OdosSpacing className="h-28" />
          <LoginButtons />
        </OdosPageBackground>
      </div>
    </div>
  );
}
