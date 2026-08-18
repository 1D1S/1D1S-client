// 딥링크 도메인 검증 파일(.well-known)에 실리는 값.
//
// 앱은 flavor 마다 **다른 패키지·다른 호스트**를 쓴다(앱 저장소
// android/app/build.gradle 의 productFlavors, iOS AuthConfig.xcconfig):
//
//   prod  1day1streak.com      com.onedayonestreak.app
//   dev   dev.1day1streak.com  com.onedayonestreak.app.dev
//
// 그래서 파일 내용이 **요청 호스트에 따라 갈린다**. 배포를 두 벌로 나누는
// 대신 호스트로 고르면, 어느 환경에 올라가도 그 도메인에 맞는 답이 나간다.

/** Apple Developer Team ID. 앱 세션이 확인해 준 값. */
const APPLE_TEAM_ID = 'VF3TAS8J2N';

const PROD_PACKAGE = 'com.onedayonestreak.app';
const DEV_PACKAGE = `${PROD_PACKAGE}.dev`;

/**
 * 업로드 키 SHA-256.
 *
 * 로컬·직접 설치(APK) 빌드는 이 키로 서명된다. Play 로 올린 빌드는 Play 가
 * 다시 서명하므로 이 지문만으로는 **스토어 설치본에서 App Links 검증이
 * 안 된다** — 아래 PLAY_SIGNING_SHA256 이 반드시 함께 들어가야 한다.
 */
const UPLOAD_KEY_SHA256 =
  'E3:32:B9:86:FD:C8:0E:A0:67:B9:71:A7:E7:A5:3A:FE:8B:BB:92:21:47:6C:70:36:7A:96:D5:C5:54:7C:00:14';

/**
 * Play 앱 서명 키 SHA-256 — **아직 없다**.
 *
 * Play Console > 설정 > 앱 서명 > "앱 서명 키 인증서" 의 SHA-256 지문이다
 * (업로드 키 인증서가 아니다 — 둘은 다른 값이고, 스토어 설치본을 검증하는
 * 것은 앱 서명 키 쪽이다). 값이 오면 이 상수만 채우면 되고, 아래 목록이
 * 자동으로 두 개가 된다.
 */
const PLAY_SIGNING_SHA256: string | null = null;

const ANDROID_FINGERPRINTS = [UPLOAD_KEY_SHA256, PLAY_SIGNING_SHA256].filter(
  (value): value is string => Boolean(value)
);

/**
 * 이 호스트가 dev 환경인가.
 *
 * `dev.1day1streak.com` 과 로컬 별칭(`local.dev.…`)이 dev 앱을 가리킨다.
 * 그 외(운영 도메인, 프리뷰 도메인)는 prod 로 본다 — 모르는 호스트에
 * dev 앱 ID 를 내주는 것보다 운영 값을 내주는 편이 안전하다.
 */
function isDevHost(host: string): boolean {
  const hostname = host.split(':')[0].toLowerCase();
  return hostname === 'dev.1day1streak.com' || hostname.endsWith('.dev.1day1streak.com');
}

/** iOS Universal Links 용 appID (`TeamID.BundleID`). */
export function resolveAppleAppId(host: string): string {
  return `${APPLE_TEAM_ID}.${isDevHost(host) ? DEV_PACKAGE : PROD_PACKAGE}`;
}

/** Android App Links 용 패키지명. */
export function resolveAndroidPackage(host: string): string {
  return isDevHost(host) ? DEV_PACKAGE : PROD_PACKAGE;
}

/**
 * 앱이 가로채는 경로. 앱의 intent-filter(`pathPrefix=/challenge`, `/diary`)와
 * 같은 범위여야 한다 — 여기만 넓히면 앱에 없는 화면 링크가 앱으로 끌려간다.
 */
export const APP_LINK_COMPONENTS = [
  { '/': '/challenge/*' },
  { '/': '/diary/*' },
];

export function buildAppleAppSiteAssociation(host: string): unknown {
  return {
    applinks: {
      details: [
        {
          appIDs: [resolveAppleAppId(host)],
          components: APP_LINK_COMPONENTS,
        },
      ],
    },
  };
}

export function buildAssetLinks(host: string): unknown {
  return [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: resolveAndroidPackage(host),
        sha256_cert_fingerprints: ANDROID_FINGERPRINTS,
      },
    },
  ];
}
