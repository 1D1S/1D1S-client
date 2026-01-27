'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { GlobalChrome } from '@1d1s/design-system';

export default function GlobalChromeWrapper(): React.ReactElement {
  const pathname = usePathname();
  return <GlobalChrome pathname={pathname} />;
}
