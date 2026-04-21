# 아키텍처

---

## 기술 스택

| 레이어             | 기술                                 |
| ------------------ | ------------------------------------ |
| 런타임             | Node.js 20+, pnpm 10                |
| 프레임워크         | Next.js 16.1.5 (App Router)         |
| 언어               | TypeScript 5.8.2                     |
| UI                 | React 19.2.4, Tailwind CSS 4        |
| 디자인 시스템      | @1d1s/design-system (v0.2.33)       |
| HTTP 클라이언트    | Axios 1.9                           |
| 서버 상태          | TanStack React Query v5             |
| 폼                 | React Hook Form 7 + Zod 3           |
| 에디터             | Tiptap 3.20 (일지 작성)             |
| 애니메이션         | Framer Motion 12                    |
| UI 컴포넌트        | Radix UI, CVA, Vaul, Sonner         |

---

## 요청 처리 흐름

```
브라우저
  -> middleware.ts            # 보안 헤더, 인증 검증, 리다이렉트
  -> app/layout.tsx           # RootLayout + AppProviders
  -> Provider 체인            # 아래 참조
  -> app/*/page.tsx           # 라우팅, 서버 데이터 프리페치
  -> app.feature/*/screen/    # 도메인 화면 렌더링
  -> REST API (Axios)
```

---

## Provider 체인

```
RootLayout
└─ AppProviders                  src/app.module/providers/index.tsx
   ├─ QueryClientProvider        src/app.module/providers/query-client-provider.tsx
   │  └─ ReactQueryDevtools
   ├─ ToastProvider              src/app.module/providers/toast-provider.tsx
   │  └─ Toaster (Sonner)
   └─ children
      └─ AppLayoutShell          src/app.component/layout/app-layout-shell.tsx
         ├─ AppHeader            @1d1s/design-system
         ├─ RightSidebar         @1d1s/design-system
         └─ children (페이지 콘텐츠)
```

**AppProviders 역할**: TanStack Query Provider + Devtools, Toast 알림 시스템

**AppLayoutShell 역할**: 메인 레이아웃 (헤더, 사이드바), 사용자 인증 상태 기반 UI 분기

---

## 디렉토리 구조

```
src/
├── app/                    # App Router — 라우팅, 레이아웃, 페이지
│   ├── (auth)/             # 인증 라우트 그룹 (login, signup)
│   ├── challenge/          # 챌린지 페이지
│   ├── diary/              # 일지 페이지
│   ├── mypage/             # 마이페이지
│   ├── member/             # 회원 프로필
│   ├── notification/       # 알림
│   ├── inquiry/            # 문의
│   ├── onboarding/         # 온보딩
│   ├── api/                # API Routes
│   └── dev-test/           # 개발 테스트
├── app.feature/            # 도메인 기능 모듈 (아래 상세)
├── app.component/          # 재사용 UI 컴포넌트
│   ├── layout/             # 레이아웃 (app-layout-shell, context)
│   └── ui/                 # Base UI (form, label, scroll-area)
├── app.module/             # 핵심 모듈
│   ├── api/                # Axios 인스턴스, 인터셉터, 에러 처리
│   ├── middleware/          # Next.js 미들웨어 (auth, headers, security)
│   ├── utils/              # 유틸 (auth, cn, date, nickname)
│   ├── providers/          # React Provider (QueryClient, Toast)
│   ├── config/             # 설정
│   └── lib/                # 라이브러리 (query-client, prefetch, font)
├── app.styles/             # 글로벌 스타일
│   ├── globals.css         # Tailwind 진입점 + 커스텀 변수
│   ├── colors.css          # 색상 팔레트
│   ├── typography.css      # 타이포그래피
│   ├── animation.css       # 애니메이션
│   ├── shape.css           # 모양/간격
│   └── shadow.css          # 그림자
├── app.constants/          # 전역 상수 (categories, feature data)
├── app.lib/                # 유틸리티 라이브러리
│   ├── get-query-client.ts # QueryClient 팩토리
│   ├── prefetch.tsx        # 서버 사이드 프리페치 헬퍼
│   └── font.ts             # 폰트 로딩
└── types/                  # 글로벌 TypeScript 정의
```

---

## 라우팅 구조

### Route Group -> URL 매핑

| Route Group / Path | URL                          | 주요 페이지          |
| ------------------- | ---------------------------- | -------------------- |
| `(auth)`            | `/login`, `/signup`          | 로그인, 회원가입     |
| `challenge/`        | `/challenge`, `/challenge/*` | 챌린지 목록/상세/작성 |
| `diary/`            | `/diary`, `/diary/*`         | 일지 목록/상세/작성   |
| `mypage/`           | `/mypage`                    | 마이페이지            |
| `member/`           | `/member/[id]`               | 회원 프로필           |
| `notification/`     | `/notification`              | 알림                  |
| `onboarding/`       | `/onboarding`                | 온보딩                |

### 동적 라우트 (주요)

```
app/challenge/[id]/page.tsx
app/diary/[id]/page.tsx
app/member/[id]/page.tsx
```

### Page -> Screen 패턴

```ts
// app/challenge/[id]/page.tsx
import ChallengeDetailScreen
  from '@feature/challenge/detail/screen/ChallengeDetailScreen';

export default async function ChallengeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ChallengeDetailScreen id={params.id} />;
}
```

---

## app.feature 도메인 구조

```
src/app.feature/
├── auth/               # 인증 (로그인, 회원가입)
├── challenge/          # 챌린지
│   ├── board/          # 목록/메인
│   ├── detail/         # 상세
│   └── write/          # 작성/수정
├── diary/              # 일지
│   ├── board/          # 목록
│   ├── detail/         # 상세
│   ├── write/          # 작성/수정
│   └── shared/         # 공유 유틸
├── home/               # 홈
└── member/             # 회원
```

### Feature 내부 구조

```
app.feature/{기능명}/{서브모듈}/
├── screen/        # *Screen.tsx (PascalCase) <- 진입점
├── components/    # PascalCase.tsx UI 컴포넌트
├── hooks/         # use*.ts (camelCase) TanStack Query 훅
├── api/           # *Api.ts (camelCase) API 함수
├── type/          # camelCase.ts TypeScript 타입
├── consts/        # camelCase.ts 상수, Query Keys
└── utils/         # camelCase.ts 유틸리티
```

---

## 상태 관리

| 상태 유형          | 도구               | 용도                              |
| ------------------ | ------------------ | --------------------------------- |
| 서버 상태          | TanStack Query v5  | API 데이터 캐싱, 무한 스크롤      |
| 폼 상태            | React Hook Form    | 폼 입력, 검증 (Zod 연동)          |
| 로컬 UI 상태       | React useState     | 모달, 토글, 일시적 UI 상태         |
| 인증 상태          | Cookie + localStorage | 토큰 저장, 인증 힌트             |

---

## 미들웨어 역할 (`src/app.module/middleware/`)

| 미들웨어     | 역할                                               |
| ------------ | -------------------------------------------------- |
| `auth.ts`    | 보호 라우트 토큰 검증, 미인증 시 리다이렉트         |
| `headers.ts` | CSP, X-Frame-Options, Cache-Control 보안 헤더 주입  |
| `security.ts`| 봇 차단, IP 기반 Rate Limiting                     |
| `redirect.ts`| URL 리다이렉트/리라이트                            |
| `logging.ts` | 요청 로깅, 응답 시간 측정                          |

실행 순서: Logging -> Security -> Auth -> Redirect -> Headers -> Logging

---

## 스타일 & 정적 자산

| 항목             | 위치                         |
| ---------------- | ---------------------------- |
| 글로벌 CSS       | `src/app.styles/globals.css` |
| 색상 팔레트      | `src/app.styles/colors.css`  |
| 타이포그래피     | `src/app.styles/typography.css` |
| Tailwind 설정    | `src/app.styles/globals.css` (@theme) |
| 정적 자산        | `public/`                    |
| 디자인 시스템    | `@1d1s/design-system`       |
