# 라우트 접근 정책 & 인증

---

## 관련 파일

| 역할                   | 파일                                              |
| ---------------------- | ------------------------------------------------- |
| 미들웨어 진입점        | `src/middleware.ts` (matcher) → `proxy` re-export |
| 미들웨어 체인          | `src/app.module/middleware/middleware.ts`         |
| 인증 미들웨어          | `src/app.module/middleware/auth.ts`               |
| 보안 헤더 미들웨어     | `src/app.module/middleware/headers.ts`            |
| 보안 미들웨어          | `src/app.module/middleware/security.ts`           |
| 리다이렉트 미들웨어    | `src/app.module/middleware/redirect.ts`           |
| 로깅 미들웨어          | `src/app.module/middleware/logging.ts`            |
| 토큰 유틸 (클라이언트) | `src/app.module/utils/auth.ts` (`authStorage`)    |
| 토큰 쿠키 이름         | `src/app.module/utils/tokenCookie.ts`             |
| 서버 사이드 토큰 헬퍼  | `src/app.module/utils/serverAuth.ts`              |
| 로그인 필요 다이얼로그 | `src/app.component/LoginRequiredDialog.tsx`       |

---

## 인증 상태 관리

### `authStorage` (`src/app.module/utils/auth.ts`)

```ts
authStorage.markAuthenticated();
// -> localStorage '1d1s:isAuthenticated' = 'true'
// -> domain cookie '1d1s:hasSession' = '1' (.1day1streak.com, 7일)

authStorage.clearTokens();
// -> localStorage '1d1s:isAuthenticated' 제거
// -> domain + host cookie '1d1s:hasSession' 모두 제거

authStorage.hasTokens();
// 1) JS에서 읽히는 access 토큰 쿠키 존재 → true
// 2) 없으면 localStorage 플래그 또는 도메인 공유 힌트 쿠키로 폴백
```

### 토큰 저장

| 저장소             | 내용                                 | 관리 주체  |
| ------------------ | ------------------------------------ | ---------- |
| HTTP-Only Cookie   | Access Token                         | 백엔드     |
| HTTP-Only Cookie   | Refresh Token                        | 백엔드     |
| localStorage       | `1d1s:isAuthenticated` (인증 플래그) | 프론트엔드 |
| 도메인 공유 Cookie | `1d1s:hasSession` (서브도메인 힌트)  | 프론트엔드 |

---

## 보호 라우트 (`src/app.module/middleware/auth.ts`)

미들웨어는 두 가지 타입의 보호 규칙을 적용한다.

### list-redirect (목록으로 보냄 + `loginRequired=true`)

| 라우트 패턴       | 미인증 시 리다이렉트            |
| ----------------- | ------------------------------- |
| `/challenge/{id}` | `/challenge?loginRequired=true` |
| `/diary/{id}`     | `/diary?loginRequired=true`     |

### login-redirect (`/login`으로 보냄)

| 라우트 패턴            | 동작                    |
| ---------------------- | ----------------------- |
| `/challenge/{id}/edit` | `/login`으로 리다이렉트 |
| `/challenge/create`    | `/login`으로 리다이렉트 |
| `/mypage` (하위 포함)  | `/login`으로 리다이렉트 |
| `/notification`        | `/login`으로 리다이렉트 |

### 토큰 검증 로직

```
요청 -> middleware
  -> ACCESS_TOKEN_COOKIE_CANDIDATES 중 비어있지 않은 토큰 검색
     ├── 토큰 존재 -> 통과 (서명/유효성 검증은 TODO)
     └── 토큰 없음 -> 규칙별 리다이렉트
```

`ACCESS_TOKEN_COOKIE_CANDIDATES`는 `ACCESS_TOKEN_COOKIE_NAME`(`.env`에서 설정
가능) + `accessToken` + `devAccessToken`을 모두 포함하므로, 환경/쿠키 이름이
바뀌어도 미들웨어가 함께 동작한다.

---

## 보안 헤더 (`src/app.module/middleware/headers.ts`)

| 헤더                    | 값                                 |
| ----------------------- | ---------------------------------- |
| Content-Security-Policy | `default-src 'self'` + 허용 도메인 |
| X-Frame-Options         | `DENY`                             |
| Cache-Control           | `public, max-age=3600`             |

CSP `connect-src`에 동적으로 추가되는 도메인:

- `NEXT_PUBLIC_ODOS_API_URL`
- `NEXT_PUBLIC_ODOS_IMAGE_URL`
- `NEXT_PUBLIC_ODOS_IMAGE_BASE_URL`
- Vercel Live (`https://vercel.live`, `https://*.vercel.live`)

CSP `script-src`는 `'unsafe-eval' 'unsafe-inline'` + Vercel Live 허용,
`img-src`는 `self blob: data: https: http:`로 열려 있다.

---

## 봇 차단 & Rate Limiting (`src/app.module/middleware/security.ts`)

- 알려진 봇 User-Agent 차단: `Googlebot`, `Bingbot`, `Slurp` 등
- IP 기반 Rate Limiting: 60초 윈도우 / 매우 큰 임계치(현재는 실질적 제한 없음)
  — 운영 환경에서는 별도 게이트웨이에서 처리

---

## 클라이언트 사이드 인증 패턴

### 로그인 필요 다이얼로그

```tsx
// URL에 ?loginRequired=true 파라미터가 있으면
// LoginRequiredDialog 자동 표시 → 로그인 버튼 클릭 시 /login 이동
```

### 인증 상태 확인

```ts
import { authStorage } from '@module/utils/auth';

if (authStorage.hasTokens()) {
  // 인증된 사용자
}

authStorage.clearTokens(); // 로그아웃
```

---

## 미들웨어 실행 순서

```
1. Logging (시작 시간 기록)
2. Security (봇 차단, Rate Limiting)
3. Auth (보호 라우트 토큰 검증)
4. Redirect (URL 리다이렉트/리라이트)
5. Headers (보안 헤더 + Cache-Control)
6. Logging (응답 시간 출력)
```
