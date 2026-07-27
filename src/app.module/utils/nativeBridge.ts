// 네이티브 쉘(Flutter WebView)과 웹 간의 단방향/양방향 통신 헬퍼.
// - 웹 → 네이티브: `window.OneDayOneStreakNative.postMessage(json)`
// - 네이티브 → 웹: `window.__NATIVE_NAV__(path)` 호출 → 커스텀 이벤트
//   `native:navigate` 디스패치 → 웹은 router.push 로 흡수.
//
// 채널 이름은 Flutter 측 `kJsChannelName` 과 반드시 일치해야 한다.

import type { IconName } from '@1d1s/design-system';

const CHANNEL_NAME = 'OneDayOneStreakNative';
const NAVIGATE_EVENT = 'native:navigate';
const MODAL_RESULT_EVENT = 'native:modal_result';
const POPUP_RESULT_EVENT = 'native:popup_result';
const DATE_RESULT_EVENT = 'native:date_result';
const TOKEN_REFRESH_RESULT_EVENT = 'native:token_refresh_result';
const NATIVE_OAUTH_MARKER = '1d1s:native-oauth';

export interface NativeAuthPayload {
  isLoggedIn: boolean;
  hasUnread: boolean;
  streakDays: number;
  profileUrl?: string;
}

export interface NativeNavPayload {
  pathname: string;
}

export interface NativeScrollDirPayload {
  dir: 'up' | 'down';
  y: number;
}

export interface NativeModalButton {
  // 사용자에게 보여줄 라벨.
  label: string;
  // 사용자가 이 버튼을 선택하면 Promise 가 resolve 하는 값. 임의 식별자.
  value: string;
  // iOS/Material 다이얼로그의 강조 스타일. 'cancel' 은 회색조, 'destructive'
  // 는 빨강, 'default' 는 브랜드 강조. Flutter 측 매핑은 별도 합의.
  style?: 'default' | 'cancel' | 'destructive';
}

// 선택형 모달(예: 일지 작성 "챌린지 선택")에서 네이티브가 웹의
// ChallengeListItem(variant="picker") 카드를 그대로 그릴 수 있도록 넘기는 항목.
// 사용자가 항목을 선택하면 modal 은 challengeId 를 문자열로 resolve 한다
// (buttons[].value 와 동일 규약).
//
// ⚠️ 라벨은 **완성된 문자열**로 넘긴다. 날짜 구간(무한 챌린지 처리 포함)이나
// 참여 인원 표기를 Dart 에서 다시 조립하면 웹과 어긋나는 순간이 반드시 온다.
// 포맷 규칙의 권위는 ChallengeListItem 하나로 유지한다.
export interface NativeModalChallengeItem {
  challengeId: number;
  title: string;
  thumbnailUrl: string | null;
  // 예: "기타". 카테고리가 없으면 빈 문자열.
  categoryLabel: string;
  // 커버 이미지가 없을 때 그리는 Stripe 의 기준색(예: "#7c3aed").
  // 색 테이블(CATEGORY_STRIPE_TONES)을 앱에 복제하지 않으려고 해석된 값을
  // 넘긴다 — 카테고리가 추가돼도 앱은 그대로 따라간다.
  categoryTone: string;
  // DS IconName(예: "Code2"). 앱은 같은 이름의 lucide 아이콘으로 매핑한다.
  categoryIconName: string | null;
  // 예: "진행 중" / "모집 중" / "종료됨".
  statusLabel: string;
  // 예: "자유 목표". goalType 이 없으면 "-".
  goalLabel: string;
  // 예: "2026-07-20 ~ 2026-08-09", 무한 챌린지는 "2026-07-20 · 무한".
  dateLabel: string;
  // 예: "3/10명 참여중". 개인 챌린지(정원 1명 이하)는 null — 웹도 숨긴다.
  participantLabel: string | null;
}

export interface NativeModalOpenPayload {
  // 같은 모달 요청을 식별. 응답이 돌아오는 modal_result 의 id 와 매칭.
  id: string;
  title: string;
  message?: string;
  // 1~3개 권장. 빈 배열이면 네이티브가 기본 "확인" 1개로 채운다.
  buttons: NativeModalButton[];
  // DS ConfirmDialog 를 그대로 옮긴 상단 원형 아이콘 배지. icon 은 DS
  // IconName(예: "Close"), tone 은 배지 색 계열. 둘 다 없으면 네이티브는
  // 배지 없이 그린다 — 선택형/신고 모달 등 배지가 없는 요청과 같은 모습.
  icon?: IconName;
  tone?: 'brand' | 'danger' | 'mint';
  // 선택형 리스트 모달용. 지정 시 네이티브는 기본 알림 버튼 나열 대신 이
  // 목록을 웹 스타일 리스트(썸네일+이름)로 렌더한다. 선택 결과는 항목의
  // challengeId 문자열로 resolve 하고, 취소는 buttons 의 cancel value 를 쓴다.
  challenges?: NativeModalChallengeItem[];
  // 표시 전용 목표 리스트 모달용(예: 참여자 "OO님의 목표"). 지정 시 네이티브는
  // 이 문자열들을 1., 2. … 번호 리스트 카드로 렌더한다. 선택 결과가 없는
  // 표시 전용이므로 buttons 는 비워도 되고(닫기 X 로 dismiss), resolve 값은
  // 무시한다.
  goals?: string[];
  // 이미지 크롭 편집 모달용(챌린지 사진 맞추기). 지정 시 네이티브가 미리보기+
  // 옵션(cover/contain)+확대/가로/세로 슬라이더 편집 UI 를 그린다. 실제 크롭은
  // 웹이 원본 File 로 수행하므로(출력 100% 일치), 네이티브는 편집 파라미터만
  // JSON 문자열로 resolve 한다:
  //   {"mode":"cover|contain","zoom":number,"offsetX":number,
  //    "offsetY":number,"backgroundColor":"#ffffff"}
  // 취소는 buttons 의 cancel value. imageCrop 을 모르는 구버전 앱은 buttons
  // (cover/contain/취소)로 폴백한다.
  imageCrop?: NativeImageCropRequest;
  // 신고 모달용(일지/댓글 신고). 지정 시 네이티브가 사유 라디오 + 상세 내용
  // 입력(textarea) + 제출 UI 를 그린다. 결과는 JSON 문자열로 resolve:
  //   {"reportType":"<value>","content":"<상세내용>"}
  // 취소는 buttons 의 cancel value. report 를 모르는 구버전 앱은 buttons
  // (사유들 + 취소)로 폴백한다 — 이 경우 상세 입력이 없어 상세 필수 사유
  // (detail.requiredFor)는 제출되지 않는다(웹이 취소 처리).
  report?: NativeReportRequest;
  // 챌린지 생성 완료 모달용. 지정 시 네이티브가 웹 ChallengeCreateSuccessDialog
  // 와 같은 화면(성공 체크 + 참여 링크 + 비밀번호 + 카카오/링크 복사 +
  // [홈][챌린지 확인하기])을 그린다. 결과는 'home' | 'detail'.
  // 링크/비밀번호 복사와 카카오톡 공유는 네이티브가 끝내고 모달을 유지한다
  // (앱은 카카오 네이티브 SDK 로 앱투앱 공유 — 웹 JS SDK 는 WebView 안에서
  // 공유 창을 못 연다). challengeCreated 를 모르는 구버전 앱은
  // buttons([홈][챌린지 확인하기])로 폴백한다.
  challengeCreated?: NativeChallengeCreatedRequest;
}

export interface NativeChallengeCreatedRequest {
  challengeId: number;
  // 참여 링크 전문(origin 포함). 네이티브가 조립하지 않는다.
  shareLink: string;
  isPrivate: boolean;
  password?: string;
}

export interface NativeReportRequest {
  // 신고 사유 라디오 목록. value 는 서버 reportType 코드(예: 'SPAM').
  reasons: Array<{ value: string; label: string }>;
  // 상세 내용 입력 규칙.
  detail: {
    label: string;
    placeholder: string;
    // 이 사유들을 고르면 상세 내용 필수. 나머지는 상세 없이 제출 가능.
    requiredFor: string[];
    // 상세 입력란을 항상 노출할지(일지=true), 특정 사유에서만 펼칠지(댓글=false).
    alwaysShow: boolean;
    maxLength?: number;
  };
}

export interface NativeImageCropRequest {
  // 편집 미리보기용 축소본(장변 ~1200px 권장). 최종 크롭은 웹이 원본으로 하므로
  // 이 축소본은 표시 전용 — 화질 손실 없음.
  previewDataUrl: string;
  // 최종 출력(배너) 픽셀 크기. 편집기 미리보기 종횡비 기준.
  outputSize: { width: number; height: number };
  // contain 모드에서 여백을 채울 배경색 후보(선택).
  backgroundOptions?: string[];
}

// 메인 이벤트 팝업 한 장. 서버 ActivePopup 과 같은 모양.
export interface NativePopupSpec {
  popupKey: string;
  imageUrl: string;
  ctaText: string;
  linkUrl: string;
}

export interface NativePopupOpenPayload {
  id: string;
  // 노출 대상 전체를 한 번에 넘긴다. 2장 이상이면 네이티브가 3초 간격으로
  // 순환시킨다 (웹 HomePopup 과 같은 규칙).
  popups: NativePopupSpec[];
}

// 사용자가 팝업에서 무엇을 했는지. dismiss(밖 클릭/시스템 백) 는 'close'.
export type NativePopupAction = 'cta' | 'dismissForever' | 'close';

export interface NativePopupOutcome {
  action: NativePopupAction;
  // 액션 시점에 보이던 팝업. 캐러셀이 돌므로 첫 장과 다를 수 있다.
  popupKey: string;
}

// 날짜는 전부 'YYYY-MM-DD' 로컬 날짜 문자열. Date 를 직렬화하면 타임존에
// 따라 하루가 밀린다.
export interface NativeDatePickerPayload {
  id: string;
  value?: string;
  min?: string;
  max?: string;
  // [min, max] 안에서 개별적으로 막을 날짜 (예: 이미 일지를 쓴 날).
  disabled?: string[];
}

// 스토리 한 장. 시간 라벨은 웹이 미리 계산해 보낸다 — 상대 시간 규칙을
// 네이티브에 복제하지 않기 위해.
export interface NativeStoryItem {
  diaryId: number;
  title: string;
  thumbnail: string | null;
  timeLabel: string;
  unread: boolean;
}

export interface NativeStoryGroup {
  userName: string;
  profileImage: string | null;
  stories: NativeStoryItem[];
}

export interface NativeStoryOpenPayload {
  startGroup: number;
  groups: NativeStoryGroup[];
}

export type NativeMessage =
  | { type: 'auth_state'; payload: NativeAuthPayload }
  | { type: 'nav_state'; payload: NativeNavPayload }
  // 앱 부팅 1회. 웹이 첫 페인트 + 4탭 prefetch 워밍업까지 끝낸 시점.
  // 네이티브 쉘은 이 신호를 받기 전까진 스플래시를 유지해, 사용자에게
  // 빈 컨테이너나 절반만 로드된 UI 가 노출되지 않게 한다.
  | { type: 'app_ready' }
  // 스크롤 방향이 바뀔 때만 1회. 네이티브 쉘이 sliver-style AppBar 를
  // collapse/expand 하는 용도. 매 프레임 보내는 대신 방향 전환에만 발화해
  // JS 채널 트래픽을 최소화한다.
  | { type: 'scroll_dir'; payload: NativeScrollDirPayload }
  | { type: 'oauth_open'; payload: { url: string } }
  | { type: 'token_refresh'; payload: { id: string } }
  | { type: 'logout' }
  | {
      type: 'progress_open';
      payload: { message: string };
    }
  | { type: 'progress_close' }
  // 토스트를 네이티브가 그린다. WebView 안에 그리면 네이티브 헤더/바텀바
  // 아래에 깔리고, 상세처럼 WebView 가 화면 일부만 차지할 때는 위치도
  // 어긋난다. 앱은 화면 상단 중앙에 띄운다(웹은 top-right).
  | { type: 'toast'; payload: NativeToastPayload }
  | { type: 'push_route'; payload: { path: string } }
  // 네이티브 다이얼로그 노출 요청. 응답은 native:modal_result CustomEvent
  // 로 비동기 도착. openNativeModal() 헬퍼가 id 매칭으로 Promise 화 한다.
  | { type: 'modal_open'; payload: NativeModalOpenPayload }
  // 네이티브 이벤트 팝업 노출 요청. 응답은 native:popup_result CustomEvent.
  | { type: 'popup_open'; payload: NativePopupOpenPayload }
  // 네이티브 이미지 뷰어(라이트박스). 결과 회신 없음 — fire-and-forget.
  | { type: 'image_viewer_open'; payload: { urls: string[]; index: number } }
  // 네이티브 날짜 피커. 응답은 native:date_result CustomEvent.
  | { type: 'date_picker_open'; payload: NativeDatePickerPayload }
  // 네이티브 스토리 뷰어. 진행/이동/닫기는 네이티브가 처리하고, 읽음
  // 처리용 native:story_viewed 이벤트만 웹으로 돌아온다.
  | { type: 'story_open'; payload: NativeStoryOpenPayload };

interface NativeChannel {
  postMessage(payload: string): void;
}

interface NativeWindow extends Window {
  [CHANNEL_NAME]?: NativeChannel;
  __IS_NATIVE_APP__?: boolean;
  __NATIVE_NAV__?(path: string): void;
  // 쉘 빌드가 처리 가능한 브릿지 메시지 플래그. injectHandshake 가 세운다.
  __1D1S_FEATURES__?: Partial<Record<string, boolean>>;
}

function getNativeWindow(): NativeWindow | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window as NativeWindow;
}
// 메시지를 모르는 구버전 쉘에 요청을 보내면 응답을 영영 기다리는 죽은
// 컨트롤이 된다. 응답이 필요한 새 위임은 이 플래그를 먼저 확인한다.
function hasNativeFeature(name: string): boolean {
  return getNativeWindow()?.__1D1S_FEATURES__?.[name] === true;
}

export interface NativeToastPayload {
  title: string;
  body?: string;
  // DS ToastTone — 'brand' | 'success' | 'danger' | 'info'.
  tone?: string;
  // DS IconName. 앱이 모르는 이름이면 tone 기본 아이콘으로 떨어진다.
  icon?: string;
  // ms. 0 이하면 자동 닫힘 없음.
  duration?: number;
}

export function postNativeMessage(message: NativeMessage): void {
  const win = getNativeWindow();
  if (!win) {
    return;
  }
  const channel = win[CHANNEL_NAME];
  if (!channel) {
    return;
  }
  try {
    channel.postMessage(JSON.stringify(message));
  } catch {
    // 네이티브 쉘이 응답하지 못하더라도 웹 흐름을 멈추지 않는다.
  }
}

export function isNativeBridgeAvailable(): boolean {
  return getNativeWindow()?.[CHANNEL_NAME] != null;
}

export function isNativeModalAvailable(): boolean {
  return getNativeWindow()?.[CHANNEL_NAME] != null && hasNativeFeature('modal');
}

/**
 * SPA 데이터 요청이 끝나기 전에 네이티브 화면을 먼저 연다. 앱이 아닌
 * 환경에서는 false를 반환하므로 호출자가 router.push로 폴백할 수 있다.
 */
export function requestNativePushRoute(path: string): boolean {
  if (
    !path.startsWith('/') ||
    getNativeWindow()?.[CHANNEL_NAME] == null ||
    !hasNativeFeature('pushRoute')
  ) {
    return false;
  }
  postNativeMessage({ type: 'push_route', payload: { path } });
  return true;
}

export function showNativeProgress(message: string): boolean {
  if (
    getNativeWindow()?.[CHANNEL_NAME] == null ||
    !hasNativeFeature('progress')
  ) {
    return false;
  }
  postNativeMessage({ type: 'progress_open', payload: { message } });
  return true;
}

/**
 * 네이티브 토스트로 위임한다. 성공하면 true — 호출자는 웹 토스트를
 * 그리지 않는다. 구버전 쉘(toast 기능 없음)이면 false 라 웹 토스트로
 * 폴백한다.
 */
export function showNativeToast(payload: NativeToastPayload): boolean {
  if (getNativeWindow()?.[CHANNEL_NAME] == null || !hasNativeFeature('toast')) {
    return false;
  }
  postNativeMessage({ type: 'toast', payload });
  return true;
}

export function isNativeProgressAvailable(): boolean {
  return (
    getNativeWindow()?.[CHANNEL_NAME] != null && hasNativeFeature('progress')
  );
}

export function hideNativeProgress(): void {
  if (getNativeWindow()?.[CHANNEL_NAME] == null) {
    return;
  }
  postNativeMessage({ type: 'progress_close' });
}

export function markNativeOAuth(codeChallenge: string): void {
  window.sessionStorage.setItem(NATIVE_OAUTH_MARKER, codeChallenge);
}

export function consumeNativeOAuth(): string | null {
  const codeChallenge = window.sessionStorage.getItem(NATIVE_OAUTH_MARKER);
  if (codeChallenge) {
    window.sessionStorage.removeItem(NATIVE_OAUTH_MARKER);
  }
  return codeChallenge;
}

export function peekNativeOAuth(): string | null {
  return window.sessionStorage.getItem(NATIVE_OAUTH_MARKER);
}

interface PendingTokenRefresh {
  resolve(): void;
  reject(reason: Error): void;
  timeout: number;
}

const pendingTokenRefreshes = new Map<string, PendingTokenRefresh>();
let tokenRefreshListenerAttached = false;

/**
 * 네이티브 토큰 갱신 실패. 예전엔 `reject()` 를 인자 없이 불러 rejection
 * 이유가 `undefined` 였다 — 이게 그대로 흘러가면 normalizeApiError 가
 * 기본 메시지("요청 처리 중 오류가 발생했습니다")로 토스트하고,
 * shouldSkipToast 의 WeakSet 중복 제거도 객체가 아니라 못 걸어서 로그아웃
 * 때마다 같은 토스트가 여러 번 떴다.
 *
 * 세션 만료는 사용자 잘못이 아니라 조용히 정리할 일이므로, 이 타입은
 * notifyApiError 가 토스트 없이 인증 처리로 흘려보낸다.
 */
export class NativeTokenRefreshError extends Error {
  constructor(message = '네이티브 토큰 갱신 실패') {
    super(message);
    this.name = 'NativeTokenRefreshError';
  }
}

function ensureTokenRefreshListener(): void {
  if (tokenRefreshListenerAttached) {
    return;
  }
  const win = getNativeWindow();
  if (!win) {
    return;
  }
  win.addEventListener(TOKEN_REFRESH_RESULT_EVENT, (event: Event) => {
    const detail = (event as CustomEvent<{ id?: string; ok?: boolean }>).detail;
    if (!detail?.id) {
      return;
    }
    const pending = pendingTokenRefreshes.get(detail.id);
    if (!pending) {
      return;
    }
    pendingTokenRefreshes.delete(detail.id);
    window.clearTimeout(pending.timeout);
    if (detail.ok) {
      pending.resolve();
    } else {
      pending.reject(new NativeTokenRefreshError());
    }
  });
  tokenRefreshListenerAttached = true;
}

export function requestNativeTokenRefresh(): Promise<void> | null {
  const channel = getNativeWindow()?.[CHANNEL_NAME];
  if (!channel) {
    return null;
  }
  ensureTokenRefreshListener();
  const id = `refresh_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pendingTokenRefreshes.delete(id);
      reject(new NativeTokenRefreshError('네이티브 토큰 갱신 응답 없음'));
    }, 15_000);
    pendingTokenRefreshes.set(id, { resolve, reject, timeout });
    try {
      channel.postMessage(
        JSON.stringify({ type: 'token_refresh', payload: { id } })
      );
    } catch {
      window.clearTimeout(timeout);
      pendingTokenRefreshes.delete(id);
      reject(new NativeTokenRefreshError('네이티브 채널 전송 실패'));
    }
  });
}

export function onNativeNavigateRequest(
  handler: (path: string) => void
): () => void {
  const win = getNativeWindow();
  if (!win) {
    return () => {};
  }
  const listener = (event: Event): void => {
    const detail = (event as CustomEvent<{ to?: string }>).detail;
    if (!detail?.to) {
      return;
    }
    // preventDefault 는 "내가 처리한다" 시그널. Flutter 측 __NATIVE_NAV__
    // 가 dispatchEvent 반환값을 보고 fallback (location.assign 풀 리로드)
    // 을 건너뛴다. 이 호출이 빠지면 React Query 캐시가 매번 휘발되어
    // 사용자가 탭 전환마다 로딩을 다시 보게 된다.
    event.preventDefault();
    handler(detail.to);
  };
  win.addEventListener(NAVIGATE_EVENT, listener);
  return () => win.removeEventListener(NAVIGATE_EVENT, listener);
}

// 모달 응답 대기 큐. id → resolver. Flutter 가 사용자 선택 후 dispatchEvent
// 로 결과를 보내면 그 id 에 대응되는 resolver 를 깨우고 큐에서 삭제한다.
// Flutter 가 dialog 자체를 dismiss(밖 클릭, 백 버튼) 했을 때를 위해 value
// 는 nullable — 그 경우 호출자는 cancel 로 해석한다.
const pendingNativeModals = new Map<string, (value: string | null) => void>();
let modalResultListenerAttached = false;

function ensureModalResultListener(): void {
  if (modalResultListenerAttached) {
    return;
  }
  const win = getNativeWindow();
  if (!win) {
    return;
  }
  const listener = (event: Event): void => {
    const detail = (
      event as CustomEvent<{ id?: string; value?: string | null }>
    ).detail;
    if (!detail?.id) {
      return;
    }
    const resolver = pendingNativeModals.get(detail.id);
    if (resolver) {
      pendingNativeModals.delete(detail.id);
      resolver(detail.value ?? null);
    }
  };
  win.addEventListener(MODAL_RESULT_EVENT, listener);
  modalResultListenerAttached = true;
}

function generateModalId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 네이티브 쉘에 다이얼로그 노출을 요청한다. 사용자가 버튼을 선택하면 그
 * `value` 가, 다이얼로그를 dismiss(밖 클릭, 시스템 백) 하면 `null` 이
 * resolve 된다. 네이티브 쉘이 아닌 일반 브라우저에서는 즉시 `null` 을
 * resolve 해, 호출자는 자체 fallback 다이얼로그를 띄우면 된다.
 */
// 메인 이벤트 팝업을 네이티브 쉘에 위임한다. 웹 다이얼로그는 WebView 안에
// 갇혀 네이티브 헤더/바텀바를 덮지 못하므로, 앱에서는 네이티브가 그린다.
//
// 네이티브 쉘이 아니거나(브라우저) 쉘이 이 메시지를 모르는 구버전이면
// null 을 resolve 한다 → 호출자는 웹 팝업을 그대로 띄우면 된다.
const pendingNativePopups = new Map<
  string,
  (value: NativePopupOutcome | null) => void
>();
let popupResultListenerAttached = false;

function ensurePopupResultListener(): void {
  if (popupResultListenerAttached) {
    return;
  }
  const win = getNativeWindow();
  if (!win) {
    return;
  }
  win.addEventListener(POPUP_RESULT_EVENT, (event: Event) => {
    const detail = (
      event as CustomEvent<{
        id?: string;
        action?: NativePopupAction | null;
        popupKey?: string | null;
      }>
    ).detail;
    if (!detail?.id) {
      return;
    }
    const resolver = pendingNativePopups.get(detail.id);
    if (!resolver) {
      return;
    }
    pendingNativePopups.delete(detail.id);
    // action 이 없으면 dismiss — 그냥 닫기로 읽는다.
    resolver(
      detail.action && detail.popupKey
        ? { action: detail.action, popupKey: detail.popupKey }
        : { action: 'close', popupKey: '' }
    );
  });
  popupResultListenerAttached = true;
}

// 날짜 피커 응답 대기 큐. modal/popup 과 같은 pending-Map 패턴.
const pendingNativeDates = new Map<string, (value: string | null) => void>();
let dateResultListenerAttached = false;

function ensureDateResultListener(): void {
  if (dateResultListenerAttached) {
    return;
  }
  const win = getNativeWindow();
  if (!win) {
    return;
  }
  win.addEventListener(DATE_RESULT_EVENT, (event: Event) => {
    const detail = (
      event as CustomEvent<{ id?: string; value?: string | null }>
    ).detail;
    if (!detail?.id) {
      return;
    }
    const resolver = pendingNativeDates.get(detail.id);
    if (resolver) {
      pendingNativeDates.delete(detail.id);
      resolver(detail.value ?? null);
    }
  });
  dateResultListenerAttached = true;
}

/**
 * 날짜 피커를 네이티브 쉘에 위임한다. 웹 캘린더 시트는 WebView 안에 갇혀
 * 잘리고 네이티브 헤더도 못 가린다. 선택하면 'YYYY-MM-DD', dismiss 면
 * null. 네이티브 쉘이 아니면(브라우저) null — 호출자가 웹 피커로 폴백.
 */
/**
 * 스토리 뷰어를 네이티브 쉘에 위임한다. 뷰어 UI(진행바/자동 전환/이동/
 * 일지 보기)는 전부 네이티브가 그리고, 웹은 읽음 처리 이벤트만 받는다.
 * 채널이 없거나 구버전 쉘이면 false — 호출자는 웹 뷰어로 폴백.
 */
export function openNativeStoryViewer(
  payload: NativeStoryOpenPayload
): boolean {
  const win = getNativeWindow();
  if (!win?.[CHANNEL_NAME] || !hasNativeFeature('storyViewer')) {
    return false;
  }
  postNativeMessage({ type: 'story_open', payload });
  return true;
}

/** 네이티브 스토리 뷰어가 보내는 "이 일지를 봤다" 이벤트 구독. */
export function onNativeStoryViewed(
  handler: (diaryId: number) => void
): () => void {
  const win = getNativeWindow();
  if (!win) {
    return () => {};
  }
  const listener = (event: Event): void => {
    const detail = (event as CustomEvent<{ diaryId?: number }>).detail;
    if (typeof detail?.diaryId === 'number') {
      handler(detail.diaryId);
    }
  };
  win.addEventListener('native:story_viewed', listener);
  return () => win.removeEventListener('native:story_viewed', listener);
}

/** 현재 쉘이 날짜 피커 위임을 지원하는지. 오버레이 렌더 여부 판정용. */
export function isNativeDatePickerAvailable(): boolean {
  return (
    getNativeWindow()?.[CHANNEL_NAME] != null && hasNativeFeature('datePicker')
  );
}

export function openNativeDatePicker(
  options: Omit<NativeDatePickerPayload, 'id'>
): Promise<string | null> | null {
  const win = getNativeWindow();
  if (!win?.[CHANNEL_NAME] || !hasNativeFeature('datePicker')) {
    return null;
  }
  ensureDateResultListener();
  const id = generateModalId();
  return new Promise<string | null>((resolve) => {
    pendingNativeDates.set(id, resolve);
    postNativeMessage({
      type: 'date_picker_open',
      payload: { id, ...options },
    });
  });
}

/**
 * 이미지 뷰어(라이트박스)를 네이티브 쉘에 위임한다. 웹 오버레이는 WebView
 * 안에 갇혀 네이티브 헤더를 덮지 못한다. 채널이 없으면(브라우저) false 를
 * 반환하고, 호출자는 자체 웹 오버레이를 연다.
 */
export function openNativeImageViewer(urls: string[], index: number): boolean {
  if (!getNativeWindow()?.[CHANNEL_NAME]) {
    return false;
  }
  postNativeMessage({ type: 'image_viewer_open', payload: { urls, index } });
  return true;
}

// 타임아웃은 두지 않는다. 결과는 사용자가 버튼을 누를 때 오므로 몇 초 안에
// 온다는 보장이 없고, 성급히 null 로 떨어뜨리면 네이티브 팝업이 떠 있는 채로
// 웹 팝업까지 겹쳐 뜬다. popup_open 을 모르는 구버전 쉘에서는 이벤트 팝업이
// 뜨지 않는데(기능 손실이지 오동작은 아니다), 웹과 앱을 같이 배포하면 된다.
// openNativeModal 도 같은 약속이다.
export function openNativePopup(
  popups: NativePopupSpec[]
): Promise<NativePopupOutcome | null> {
  const win = getNativeWindow();
  if (!win?.[CHANNEL_NAME]) {
    return Promise.resolve(null);
  }
  ensurePopupResultListener();
  const id = generateModalId();
  return new Promise<NativePopupOutcome | null>((resolve) => {
    pendingNativePopups.set(id, resolve);
    postNativeMessage({ type: 'popup_open', payload: { id, popups } });
  });
}

export function openNativeModal(
  options: Omit<NativeModalOpenPayload, 'id'>
): Promise<string | null> {
  const win = getNativeWindow();
  if (!win) {
    return Promise.resolve(null);
  }
  if (!win[CHANNEL_NAME]) {
    return Promise.resolve(null);
  }
  ensureModalResultListener();
  const id = generateModalId();
  return new Promise<string | null>((resolve) => {
    pendingNativeModals.set(id, resolve);
    postNativeMessage({
      type: 'modal_open',
      payload: { id, ...options },
    });
  });
}

export function isNativeChallengeCreatedModalAvailable(): boolean {
  return (
    getNativeWindow()?.[CHANNEL_NAME] != null &&
    hasNativeFeature('challengeCreatedModal')
  );
}
