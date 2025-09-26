'use client';

import { Ssgoi } from '@ssgoi/react';
import { fade } from '@ssgoi/react/view-transitions';
interface SsgoiWrapperProps {
  children: React.ReactNode;
}

export default function SsgoiWrapper({ children }: SsgoiWrapperProps) {
  return <Ssgoi config={{ defaultTransition: fade() }}>{children}</Ssgoi>;
}
