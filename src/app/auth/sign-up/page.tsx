'use client';
import { SignUpForm } from '@/features/auth/presentation/components/sign-up-form';
import { PageBackground as OdosPageBackground } from '@1d1s/design-system';

export default function SignUpPage(): React.ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <OdosPageBackground className="min-h-screen min-w-150 px-5">
          <SignUpForm />
        </OdosPageBackground>
      </div>
    </div>
  );
}
