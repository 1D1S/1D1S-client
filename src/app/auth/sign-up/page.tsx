'use client';
import { SignUpForm } from '@/features/auth/presentation/components/sign-up-form';
import { PageBackground } from '@1d1s/design-system';

export default function SignUpPage(): React.ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <PageBackground className="min-h-screen min-w-150 px-5">
          <SignUpForm />
        </PageBackground>
      </div>
    </div>
  );
}
