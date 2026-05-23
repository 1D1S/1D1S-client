# 아키텍처

---

## 기술 스택

| 레이어          | 기술                                            |
| --------------- | ----------------------------------------------- |
| 런타임          | Node.js 20+, pnpm 10.11                         |
| 프레임워크      | Next.js 16.1.5 (App Router, Turbopack)          |
| 언어            | TypeScript 5.8.2                                |
| UI              | React 19.2.4, Tailwind CSS 4.1                  |
| 디자인 시스템   | @1d1s/design-system (^1.2.2)                    |
| HTTP 클라이언트 | Axios 1.9                                       |
| 서버 상태       | TanStack React Query v5                         |
| 폼              | React Hook Form 7 + Zod 3 + @hookform/resolvers |
| 에디터          | Tiptap 3.22 (일지 작성)                         |
| 애니메이션      | Framer Motion 12                                |
| UI 컴포넌트     | Radix UI, CVA, Vaul, Sonner, cmdk               |
| Dead code 검사  | Knip 6                                          |

---

## 요청 처리 흐름

```
브라우저
  -> src/middleware.ts        # next/server matcher
  -> app.module/middleware/   # logging → security → auth → redirect → headers
  -> app/layout.tsx           # RootLayout + AppProviders + AppLayoutShell
  -> app/*/page.tsx           # 라우팅, Prefetch + Suspense
  -> app.feature/*/screen/    # 도메인 화면 렌더링
  -> REST API (Axios)
```

---

## Provider 체인

```
RootLayout                       src/app/layout.tsx
└─ AppProviders                  src/app.module/providers/index.tsx
   └─ TanStackQueryProvider      src/app.module/providers/QueryClientProvider.tsx
      ├─ ReactQueryDevtools (개발 환경)
      ├─ children
      │  ├─ ScrollToTop          src/app.component/layout/ScrollToTop.tsx
      │  └─ AppLayoutShell       src/app.component/layout/AppLayoutShell.tsx
      │     ├─ AppTopNav         src/app.component/layout/AppTopNav.tsx
      │     ├─ AppBottomNav      src/app.component/layout/AppBottomNav.tsx
      │     ├─ AppRightRail      src/app.component/layout/AppRightRail.tsx
      │     └─ children (페이지 콘텐츠)
      └─ ToastProvider           src/app.module/providers/ToastProvider.tsx
         └─ Toaster (Sonner)
```

**AppProviders 역할**: TanStack Query Provider + Devtools, Toast 알림 시스템

**AppLayoutShell 역할**: 메인 레이아웃 (탑 네비, 바텀 네비, 우측 레일), 사용자 인증 상태 기반 UI 분기

---

## 디렉토리 구조

```
src/
├── app/                    # App Router — 라우팅, 레이아웃, 페이지
│   ├── (auth)/             # 인증 라우트 그룹 (login, signup, OAuth2 콜백)
│   ├── api/                # API Routes (revalidate 등)
│   ├── challenge/          # 챌린지 페이지
│   ├── dev-test/           # 개발 테스트
│   ├── diary/              # 일지 페이지
│   ├── inquiry/            # 문의
│   ├── member/             # 회원 프로필 (`[memberId]`)
│   ├── mypage/             # 마이페이지 (diary, friend, settings)
│   ├── notification/       # 알림
│   ├── onboarding/         # 온보딩
│   ├── privacy/            # 개인정보 처리방침
│   ├── terms/              # 이용약관
│   ├── favicon.ico
│   ├── layout.tsx          # RootLayout
│   ├── not-found.tsx
│   └── page.tsx            # 홈
├── app.feature/            # 도메인 기능 모듈 (아래 상세)
├── app.component/          # 재사용 UI 컴포넌트
│   ├── AlertDialog.tsx
│   ├── LoginRequiredDialog.tsx
│   ├── Skeleton.tsx
│   ├── cards/              # ChallengeCard, DiaryCard
│   ├── layout/             # AppLayoutShell + AppTopNav/AppBottomNav/AppRightRail/AppLayoutContext/ScrollToTop
│   ├── skeletons/          # *Skeleton.tsx 모음
│   └── ui/                 # Base UI (Form 등)
├── app.module/             # 핵심 모듈
│   ├── api/                # Axios 인스턴스, 인터셉터, 에러 처리, prefetch용 server API
│   ├── middleware/          # Next.js 미들웨어 (auth, headers, security, redirect, logging, middleware)
│   ├── providers/          # React Provider (QueryClientProvider, ToastProvider, index)
│   ├── hooks/              # 공용 훅 (useInViewObserver 등)
│   ├── utils/              # 유틸 (auth, cn, date, nickname, serverAuth, tokenCookie, userAgent)
│   └── config/             # 예약된 폴더 (현재 비어 있음)
├── app.lib/                # 클라이언트/RSC 공용 라이브러리
│   ├── Prefetch.tsx        # 서버 사이드 prefetch + HydrationBoundary
│   ├── font.ts             # Pretendard 폰트 로딩
│   └── getQueryClient.ts   # QueryClient 팩토리 (RSC/client 양쪽)
├── app.styles/             # 글로벌 스타일
│   ├── animation.css       # 애니메이션
│   ├── colors.css          # 색상 팔레트 (oklch + light/dark)
│   ├── globals.css         # Tailwind 진입점 + @theme
│   ├── shadow.css          # 그림자
│   └── typography.css      # 타이포그래피
├── app.constants/          # 전역 상수
│   ├── categories.ts
│   └── consts/             # homeData.ts, inquiryData.ts
├── types/                  # 글로벌 TypeScript 정의 (필요 시)
└── middleware.ts           # Next.js 미들웨어 엔트리 (matcher 정의 + proxy export)
```

---

## 라우팅 구조

### Route Group / Path -> URL 매핑

| 경로                        | URL                                            | 주요 페이지        |
| --------------------------- | ---------------------------------------------- | ------------------ |
| `(auth)`                    | `/login`, `/signup`                            | 로그인, 회원가입   |
| `(auth)/login/oauth2/code/` | `/login/oauth2/code/[provider]`                | OAuth2 콜백        |
| `challenge/`                | `/challenge`, `/challenge/[id]`                | 챌린지 목록/상세   |
| `challenge/[id]/edit/`      | `/challenge/[id]/edit`                         | 챌린지 수정        |
| `challenge/[id]/diary/`     | `/challenge/[id]/diary`                        | 챌린지별 일지 목록 |
| `challenge/create/`         | `/challenge/create`                            | 챌린지 작성        |
| `diary/`                    | `/diary`, `/diary/[id]`                        | 일지 목록/상세     |
| `diary/create/`             | `/diary/create`                                | 일지 작성          |
| `member/[memberId]/`        | `/member/[memberId]`                           | 회원 프로필        |
| `member/[memberId]/diary/`  | `/member/[memberId]/diary`                     | 회원의 일지 목록   |
| `mypage/`                   | `/mypage`                                      | 마이페이지         |
| `mypage/diary/`             | `/mypage/diary`                                | 내 일지 목록       |
| `mypage/friend/`            | `/mypage/friend`, `received`, `sent`           | 친구/요청 관리     |
| `mypage/settings/`          | `/mypage/settings`, `profile`, `notifications` | 설정               |
| `notification/`             | `/notification`                                | 알림               |
| `onboarding/`               | `/onboarding`                                  | 온보딩             |
| `inquiry/`                  | `/inquiry`                                     | 문의               |
| `privacy/`, `terms/`        | `/privacy`, `/terms`                           | 법적 고지 (legal)  |
| `api/revalidate/diary/`     | `/api/revalidate/diary`                        | ISR 무효화 API     |

### Page -> Screen 패턴

```ts
// app/diary/page.tsx
import DiaryListScreen
  from '@feature/diary/board/screen/DiaryListScreen';
import { Prefetch } from '@/app.lib/Prefetch';
import { DIARY_QUERY_KEYS } from '@feature/diary/board/consts/queryKeys';
import { getServerDiaryList } from '@module/api/serverApi';

export default function DiaryListPage(): React.ReactElement {
  return (
    <Suspense fallback={<DiaryBoardSkeleton />}>
      <Prefetch
        queries={[
          {
            type: 'infinite',
            queryKey: DIARY_QUERY_KEYS.list({ size: 12 }),
            initialPageParam: undefined,
            queryFn: () => getServerDiaryList({ size: 12 }),
          },
        ]}
      >
        <DiaryListScreen />
      </Prefetch>
    </Suspense>
  );
}
```

---

## app.feature 도메인 구조

```
src/app.feature/
├── auth/               # 로그인, 회원가입, OAuth2 (step-pages 포함)
├── challenge/          # 챌린지
│   ├── board/          # 목록/메인
│   ├── detail/         # 상세
│   ├── shared/         # 공유 컴포넌트/유틸
│   └── write/          # 작성/수정
├── diary/              # 일지
│   ├── board/          # 목록 (메인/내 일지/회원 일지)
│   ├── detail/         # 상세
│   ├── shared/         # 공유 유틸 (예: diaryImageUrl)
│   └── write/          # 작성/수정
├── friend/             # 친구 (목록, 요청 송수신)
├── home/               # 홈 (랜덤 챌린지/일지 추천)
├── inquiry/            # 문의
├── legal/              # 약관/개인정보 처리방침
├── member/             # 회원
│   ├── mypage/         # 마이페이지
│   ├── profile/        # 프로필 상세
│   └── settings/       # 설정
├── notification/       # 알림
└── stories/            # 스토리 (24h, StoryRing, StoryViewer)
```

### Feature 내부 구조

```
app.feature/{기능명}/{서브모듈}/
├── screen/        # *Screen.tsx (PascalCase) <- 진입점
├── components/    # PascalCase.tsx UI 컴포넌트
├── hooks/         # use*.ts (camelCase) TanStack Query 훅
├── api/           # *Api.ts (camelCase) API 함수
├── type/          # camelCase.ts TypeScript 타입
├── consts/        # camelCase.ts 상수, queryKeys.ts
└── utils/         # camelCase.ts 유틸리티
```

> 모든 디렉토리가 항상 있어야 하는 것은 아니며, 필요한 것만 둔다
> (예: `inquiry/`는 `consts/`, `screen/`만 존재).

---

## 상태 관리

| 상태 유형    | 도구                                                           | 용도                                       |
| ------------ | -------------------------------------------------------------- | ------------------------------------------ |
| 서버 상태    | TanStack Query v5                                              | API 데이터 캐싱, 무한 스크롤, RSC prefetch |
| 폼 상태      | React Hook Form + Zod                                          | 폼 입력, 검증 (`zodResolver`)              |
| 로컬 UI 상태 | React useState/useReducer                                      | 모달, 토글, 일시적 UI 상태                 |
| 인증 상태    | HTTP-Only Cookie + localStorage 플래그 + 도메인 공유 힌트 쿠키 | 토큰 저장 + 인증 힌트                      |

---

## 미들웨어 역할 (`src/app.module/middleware/`)

| 미들웨어        | 역할                                               |
| --------------- | -------------------------------------------------- |
| `middleware.ts` | 미들웨어 체인 진입점 (`proxy`)                     |
| `logging.ts`    | 요청 로깅, 응답 시간 측정 시작                     |
| `security.ts`   | 봇 차단, IP 기반 Rate Limiting                     |
| `auth.ts`       | 보호 라우트 토큰 검증, 미인증 시 리다이렉트        |
| `redirect.ts`   | URL 리다이렉트/리라이트                            |
| `headers.ts`    | CSP, X-Frame-Options, Cache-Control 보안 헤더 주입 |

실행 순서: Logging -> Security -> Auth -> Redirect -> Headers -> Logging (완료)

진입점은 `src/middleware.ts`이며 `proxy` 함수를 `middleware`로 re-export 한다.

---

## 스타일 & 정적 자산

| 항목          | 위치                                            |
| ------------- | ----------------------------------------------- |
| 글로벌 CSS    | `src/app.styles/globals.css`                    |
| 색상 팔레트   | `src/app.styles/colors.css`                     |
| 타이포그래피  | `src/app.styles/typography.css`                 |
| 애니메이션    | `src/app.styles/animation.css`                  |
| 그림자        | `src/app.styles/shadow.css`                     |
| Tailwind 설정 | `src/app.styles/globals.css` (`@theme`)         |
| 폰트 로딩     | `src/app.lib/font.ts` (Pretendard)              |
| 정적 자산     | `public/`                                       |
| 디자인 시스템 | `@1d1s/design-system` (Tailwind `@source` 등록) |
