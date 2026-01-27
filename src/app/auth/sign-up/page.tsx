'use client';

import { SignUpForm } from '@/features/auth/presentation/components/sign-up-form';

export default function SignUpPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex w-full flex-col px-4">
        <SignUpForm />
      </div>
    </div>
  );
}
