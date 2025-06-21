'use client';

import { cn } from '@/shared/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function BackButton(): React.ReactElement {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        'rounded-odos-2 shadow-odos-default flex h-15 w-15',
        'cursor-pointer items-center',
        'justify-center bg-white px-4 py-4',
        'text-sm transition-colors',
        'duration-200 hover:bg-gray-300'
      )}
    >
      <Image src={'/images/left-chevron'} width={24} height={24} alt="back-icon"></Image>
    </button>
  );
}
