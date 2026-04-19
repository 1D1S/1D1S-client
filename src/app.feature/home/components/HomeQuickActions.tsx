import { ChevronRight, Mail } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function HomeQuickActions(): React.ReactElement {
  return (
    <div className="w-full px-4">
      <Link
        href="/inquiry"
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl bg-sky-100 px-4 py-3 text-sky-700 transition hover:bg-sky-200"
      >
        <Mail className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">불편한 점이 있으신가요?</span>
        <div className="ml-auto flex items-center gap-0.5">
          <span className="text-sm font-medium">문의하기</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </div>
      </Link>
    </div>
  );
}
