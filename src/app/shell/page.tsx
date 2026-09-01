import NativeTabShell, { type ShellTabId } from '@feature/shell/NativeTabShell';
import React from 'react';

// 네이티브 앱 전용 진입점. 브라우저 사용자는 오지 않는다(앱이 이 URL 을
// 직접 로드한다). 탭 다섯을 한 문서에 keep-alive 로 들고 있는 이유와
// 계약은 NativeTabShell 참고.
//
// 미들웨어의 login-redirect 는 /shell 을 보호 경로로 매칭하지 않으므로
// 게스트도 이 문서를 받을 수 있다 — 마이 탭 게이트는 앱이 네이티브에서
// 이미 처리한다(비로그인이 마이를 누르면 네이티브 로그인 화면).
export default async function ShellPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}): Promise<React.ReactElement> {
  const { tab } = await searchParams;
  const initial: ShellTabId =
    tab === 'explore' ||
    tab === 'challenge' ||
    tab === 'diary' ||
    tab === 'mypage'
      ? tab
      : 'home';
  return <NativeTabShell initialTab={initial} />;
}
