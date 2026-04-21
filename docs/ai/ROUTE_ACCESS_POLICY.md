# 라우트 접근 정책 & 인증

---

## 관련 파일

| 역할                | 파일                                           |
| ------------------- | ---------------------------------------------- |
| 미들웨어 진입점     | `src/middleware.ts`                            |
| 인증 미들웨어       | `src/app.module/middleware/auth.ts`            |
| 보안 헤더 미들웨어  | `src/app.module/middleware/headers.ts`         |
| 보안 미들웨어       | `src/app.module/middleware/security.ts`        |
| 토큰 유틸           | `src/app.module/utils/auth.ts`                |
| 토큰 쿠키 이름      | `src/app.module/utils/token-cookie.ts`        |
| 로그인 필요 다이얼로그 | `src/app.component/login-required-dialog.tsx` |

---

## 인증 상태 관리

### `authStorage` (`src/app.module/utils/auth.ts`)

```ts
authStorage.markAuthenticated()
// -> localStorage 'auth_authenticated' = 'true'
// -> domain cookie (.1day1streak.com) 설정

authStorage.clearTokens()
// -> localStorage 제거
// -> domain cookie 제거

authStorage.hasTokens()
// -> localStorage OR domain cookie 존재 여부
```

### 토큰 저장

| 저장소             | 토큰            | 관리 주체 |
| ------------------ | --------------- | --------- |
| HTTP-Only Cookie   | Access Token    | 백엔드    |
| HTTP-Only Cookie   | Refresh Token   | 백엔드    |
| localStorage       | 인증 플래그     | 프론트엔드 |
| 도메인 공유 Cookie | 인증 힌트       | 프론트엔드 |

---

## 보호 라우트

### 미들웨어 기반 보호 (`src/app.module/middleware/auth.ts`)

| 라우트 패턴              | 미인증 시 동작                           |
| ------------------------ | ---------------------------------------- |
| `/challenge/{id}`        | `/challenge?loginRequired=true` 리다이렉트 |
| `/diary/{id}`            | `/diary?loginRequired=true` 리다이렉트    |
| `/mypage`                | 인증 필요                                |
| `/challenge/create`      | 인증 필요                                |
| `/diary/create`          | 인증 필요                                |

### 토큰 검증 로직

```
요청 -> 미들웨어
  -> Cookie에서 JWT 토큰 검색 (복수 후보 이름)
    ├── 토큰 존재 -> 통과
    └── 토큰 없음 -> 리다이렉트 (상위 목록 + loginRequired=true)
```

---

## 보안 헤더 (`src/app.module/middleware/headers.ts`)

| 헤더                  | 값                        |
| --------------------- | ------------------------- |
| Content-Security-Policy | `default-src 'self'` + 허용 도메인 |
| X-Frame-Options       | `DENY`                    |
| Cache-Control         | `public, max-age=3600`    |

CSP `connect-src`에 동적으로 추가되는 도메인:
- API URL (`NEXT_PUBLIC_ODOS_API_URL`)
- Vercel Live (`*.vercel-scripts.com`)

---

## 봇 차단 & Rate Limiting (`src/app.module/middleware/security.ts`)

- 알려진 봇 User-Agent 차단 (Googlebot, Bingbot 등)
- IP 기반 Rate Limiting

---

## 클라이언트 사이드 인증 패턴

### 로그인 필요 다이얼로그

```ts
// URL에 loginRequired=true 파라미터가 있으면
// LoginRequiredDialog 자동 표시
// -> 로그인 버튼 클릭 -> /login 이동
```

### 인증 상태 확인

```ts
import { authStorage } from '@module/utils/auth';

// 인증 여부 확인
if (authStorage.hasTokens()) {
  // 인증된 사용자
}

// 로그아웃
authStorage.clearTokens();
```

---

## 미들웨어 실행 순서

```
1. Logging (시작)
2. Security (봇 차단, Rate Limiting)
3. Auth (보호 라우트 토큰 검증)
4. Redirect (URL 리다이렉트)
5. Headers (보안 헤더 + 캐시)
6. Logging (완료)
```
