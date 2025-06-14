'use client';
import { HeroText } from '@/features/auth/presentation/components/hero-text';
import { LoginButtons } from '@/features/auth/presentation/components/login-buttons';
import RollingText from '@/features/auth/presentation/components/rolling-text';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';

export default function SignUpPage(): React.ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <div className="w-full">menu</div>
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
            </div>
          </div>

          <OdosSpacing className="h-28" />
          <LoginButtons />
        </OdosPageBackground>
        <div className="w-full" />
      </div>
    </div>
  );
}
