import { postNativeMessage } from './nativeBridge';

// 문서(탭 WebView)당 1회만 app_ready 를 보냈는지 가드. SPA 하위 이동이나
// 다른 랜딩 화면의 중복 호출은 무시한다.
let hasSignaledReady = false;

/**
 * 랜딩 루트 화면의 **핵심 콘텐츠가 실제로 렌더된 뒤** 호출한다. `app_ready` 를
 * 문서당 정확히 1회 네이티브로 보내 스플래시를 닫게 한다.
 *
 * - 스켈레톤만 뜬 상태에서 부르면 안 된다(조기 발화 금지). 각 화면의 로딩
 *   플래그가 false 로 확정된 뒤 useSignalAppReady 로 결선한다.
 * - postNativeMessage 는 네이티브 채널이 없으면 no-op 이라 브라우저에선 무해.
 */
export function signalAppContentReady(): void {
  if (hasSignaledReady || typeof window === 'undefined') {
    return;
  }
  hasSignaledReady = true;
  postNativeMessage({ type: 'app_ready' });
}
