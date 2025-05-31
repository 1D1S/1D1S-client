'use client';
import { SignUpForm } from '@/features/auth/presentation/components/sign-up-form';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';

export default function SignUpPage(): React.ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <div className="w-full">menu</div>
        <OdosPageBackground className="min-h-screen min-w-150 px-5">
          <SignUpForm />
        </OdosPageBackground>
        <div className="w-full" />
      </div>
    </div>
  );
}
