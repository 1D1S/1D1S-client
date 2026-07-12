'use client';

import { MobileHeader } from '@1d1s/design-system';
import { useRouter } from 'next/navigation';
import React from 'react';

/**
 * 사용 가이드(모바일) 헤더.
 * 마이페이지 설정에서 진입하는 서브페이지이므로 다른 서브페이지와 동일하게
 * DS `MobileHeader`(뒤로가기 + 타이틀)를 사용한다. RSC인 GuideScreen을 그대로
 * 두기 위해 router.back 을 쓰는 이 헤더만 client 리프로 분리한다.
 */
export function GuideMobileHeader(): React.ReactElement {
  const router = useRouter();
  return <MobileHeader title="사용 가이드" onBack={() => router.back()} />;
}
