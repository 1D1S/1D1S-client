import { cn } from '@module/utils/cn';
import React from 'react';

interface LoginProcessingScreenProps {
  /**
   * true 면 현재 화면을 덮는 전체 화면 오버레이로 렌더한다.
   *
   * 리다이렉트형 소셜 로그인(구글/카카오/네이버)은 콜백 "페이지"로 이동해
   * 이 화면을 보여주지만, 애플은 JS SDK 팝업(web_message)이라 페이지 이동이
   * 없다. 그래서 애플 흐름에서는 오버레이로 같은 화면을 덮어 시각적으로
   * 동일하게 맞춘다. 기본(false)은 콜백 페이지처럼 페이지 본문으로 렌더한다.
   */
  overlay?: boolean;
}

/**
 * 소셜 로그인 처리 중 화면.
 * 리다이렉트형 콜백 페이지와 애플 팝업 흐름이 같은 UI 를 쓰도록 공용화했다.
 */
export function LoginProcessingScreen({
  overlay = false,
}: LoginProcessingScreenProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center',
        overlay && 'fixed inset-0 z-[100] bg-white'
      )}
    >
      <p className="text-gray-500">로그인 처리 중...</p>
    </div>
  );
}
