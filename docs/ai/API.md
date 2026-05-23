# API

---

## 개요

| 방식 | 용도                    | 클라이언트                      |
| ---- | ----------------------- | ------------------------------- |
| REST | 모든 데이터 CRUD + 인증 | Axios (브라우저 4개 + 서버 1개) |

---

## Axios 클라이언트

### 설정 파일 위치

```
src/app.module/api/
├── client.ts            # apiClient, publicApiClient, tokenClient, silentAuthClient
├── config.ts            # API_BASE_URL 설정
├── interceptors.ts      # attachInterceptors (토큰 갱신, subscriber 큐)
├── error.ts             # isUnauthorizedError, isRedirectError, normalizeApiError
├── errorNotify.ts       # notifyApiError, handleAuthError (`'use client'`)
├── request.ts           # requestData, requestBody, buildQueryString
├── queryInvalidation.ts # invalidateAll 헬퍼
├── serverApi.ts         # RSC prefetch용 API 함수 모음
├── serverClient.ts      # serverRequestData, serverRequestBody (쿠키 포워딩)
└── types.ts             # ApiResponse, NormalizedApiError, QueryParamValue 등
```

### 인스턴스 종류 (브라우저)

| 인스턴스           | 용도                           | 인증 | 401/302 처리                                                   |
| ------------------ | ------------------------------ | ---- | -------------------------------------------------------------- |
| `apiClient`        | 메인 API 호출                  | O    | 토큰 갱신 후 재시도, 실패 시 홈 리다이렉트                     |
| `publicApiClient`  | 비인증 엔드포인트              | X    | 갱신/리다이렉트 없음, 401이 아닌 에러만 토스트                 |
| `tokenClient`      | 토큰 갱신 전용 (auth/token 등) | X    | 인터셉터 없음 (순환 방지)                                      |
| `silentAuthClient` | 선택적 인증 (사이드바 등)      | O    | 401/302 → 토큰 갱신 후 1회 재시도, 이후 호출부에서 forceLogout |

### 서버(RSC) 헬퍼

`serverApi.ts`는 RSC `Prefetch` 컴포넌트에서 사용한다. `serverClient.ts`의
`serverRequestData` / `serverRequestBody`는 `next/headers`의 쿠키를 백엔드에
포워딩하며, 실패 시 throw 한다 (TanStack `prefetchQuery`가 내부에서 catch).

### 인터셉터 흐름 (`attachInterceptors`)

```
API 요청
  └─ Response Interceptor
     ├─ 200 OK이지만 XHR responseURL이 다른 호스트로 리다이렉트됨 (GET 한정)
     │  └─ 세션 만료로 간주 → 토큰 갱신 후 원래 요청 재시도
     └─ 401 발생
        └─ tokenClient/auth/token 으로 refresh 요청
           ├── 성공 → 새 토큰으로 원래 요청 재시도
           └── 실패 → authStorage.clearTokens() + 보호 라우트면 홈 리다이렉트
```

- 갱신 중 다른 요청은 **subscriber 큐**에 대기
- `_retry` 플래그로 무한 재시도 방지
- `responseURL` 휴리스틱 기반 자동 재시도는 **GET 요청에만** 적용
  (POST/PUT/DELETE는 중복 부작용 방지)

---

## Request 헬퍼

```ts
import { apiClient } from '@module/api/client';
import {
  buildQueryString,
  requestBody,
  requestData,
} from '@module/api/request';

// requestData: client + config → response.data.data 반환
const challenges = await requestData<Challenge[]>(apiClient, {
  url: '/challenges',
  method: 'GET',
  params,
});

// requestBody: client + config → response.data 전체 반환
const created = await requestBody<ApiResponse<Challenge>>(apiClient, {
  url: '/challenges',
  method: 'POST',
  data: body,
});

// buildQueryString: URLSearchParams 생성 (배열은 같은 key로 반복)
const qs = buildQueryString({
  page: 1,
  size: 20,
  categories: ['DEV', 'EXERCISE'],
});
// -> "page=1&size=20&categories=DEV&categories=EXERCISE"
```

> ⚠️ `requestData`/`requestBody`는 **promise가 아니라 (client, config)** 를
> 받는다. 호출부에서 직접 `client.request<T>(config)`를 호출하는 형태와 동일.

---

## TanStack Query 패턴

### Query Key Factory

```ts
// src/app.feature/diary/board/consts/queryKeys.ts
import { DiaryListParams, RandomDiaryParams } from '../type/diary';

export const DIARY_QUERY_KEYS = {
  all: ['diaries'] as const,
  lists: () => [...DIARY_QUERY_KEYS.all, 'list'] as const,
  list: (params: DiaryListParams) =>
    [...DIARY_QUERY_KEYS.lists(), params] as const,
  details: () => [...DIARY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...DIARY_QUERY_KEYS.details(), id] as const,
  randoms: () => [...DIARY_QUERY_KEYS.all, 'random'] as const,
  random: (params: RandomDiaryParams) =>
    [...DIARY_QUERY_KEYS.randoms(), params] as const,
  comments: () => [...DIARY_QUERY_KEYS.all, 'comments'] as const,
  // ...
};
```

### Query 사용

```ts
// hooks/useDiaryQueries.ts
export function useDiaryList(params: DiaryListParams) {
  return useInfiniteQuery({
    queryKey: DIARY_QUERY_KEYS.list(params),
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => getDiaryList({ ...params, cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.nextCursor : undefined,
  });
}

export function useDiaryDetail(id: number) {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.detail(id),
    queryFn: () => getDiaryDetail(id),
  });
}
```

### Mutation + 캐시 무효화

```ts
// hooks/useDiaryMutations.ts
import { invalidateAll } from '@module/api/queryInvalidation';

export function useCreateDiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDiary,
    onSuccess: () => {
      invalidateAll(queryClient, [
        DIARY_QUERY_KEYS.lists(),
        DIARY_QUERY_KEYS.my(),
        DIARY_QUERY_KEYS.randoms(),
      ]);
    },
  });
}
```

### Fetch Policy (QueryClient 기본값)

`src/app.lib/getQueryClient.ts`에서 정의:

```ts
defaultOptions: {
  queries: {
    staleTime: 60 * 1000,            // 60초
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // 4xx (특히 401)는 재시도 안 함, 그 외는 최대 2회
      if (status === 401 || (status >= 400 && status < 500)) return false;
      return failureCount < 2;
    },
  },
  mutations: { retry: false },
  dehydrate: {
    // RSC prefetch 시 success/pending 만 dehydrate (error는 제외)
    shouldDehydrateQuery: (query) =>
      query.state.status === 'success' || query.state.status === 'pending',
  },
}
```

`QueryCache.onError` / `MutationCache.onError`는 클라이언트 한정으로
`errorNotify`를 dynamic import 해 토스트를 띄운다.

---

## 서버 사이드 프리페치

```ts
// src/app.lib/Prefetch.tsx
import { Prefetch } from '@/app.lib/Prefetch';

// 단일/복수 쿼리 + infinite 쿼리 모두 지원
export default async function Page() {
  return (
    <Prefetch
      queries={[
        {
          queryKey: KEY_A,
          queryFn: () => getServerA(),
        },
        {
          type: 'infinite',
          queryKey: DIARY_QUERY_KEYS.list(params),
          initialPageParam: undefined,
          queryFn: () => getServerDiaryList(params),
        },
      ]}
    >
      <ScreenComponent />
    </Prefetch>
  );
}
```

- 각 쿼리는 독립적으로 수행되며, 실패해도 페이지 렌더가 깨지지 않는다.
- 클라이언트는 마운트 시 캐시가 없는 쿼리를 새로 fetch 한다.

---

## REST API Routes

### 엔드포인트 (Next.js API Routes)

| 경로                    | 메서드 | 설명                             |
| ----------------------- | ------ | -------------------------------- |
| `/api/revalidate/diary` | POST   | 일지 관련 ISR/캐시 무효화 트리거 |

---

## 인증 (토큰)

### 저장 방식

| 저장소             | 용도                                              | 관리       |
| ------------------ | ------------------------------------------------- | ---------- |
| HTTP-Only Cookie   | Access Token, Refresh Token                       | 백엔드     |
| localStorage       | 인증 플래그 (`1d1s:isAuthenticated`)              | 프론트엔드 |
| 도메인 공유 Cookie | 인증 힌트 (`1d1s:hasSession`, `.1day1streak.com`) | 프론트엔드 |

`authStorage.hasTokens()`는 하이브리드 전략:

1. JS에서 읽히는 access 토큰 쿠키 존재 → true (개발 환경 `devAccessToken`)
2. 없으면 localStorage 플래그 또는 도메인 공유 힌트 쿠키로 폴백
   (HttpOnly 상용 환경 대응 — 401 응답 시 즉시 `clearTokens()`로 정리)

### 토큰 갱신 흐름

```
API 요청
  -> 401 / responseURL redirect 감지
  -> interceptor
     -> axios.get(`${API_BASE_URL}/auth/token`, { withCredentials: true })
        ├── 성공 -> 백엔드가 Set-Cookie 갱신 + 원래 요청 재시도
        └── 실패 -> authStorage.clearTokens() + handleAuthError
                   (보호 라우트면 홈 `/`로 location.assign)
```

### Cookie 이름

| 환경        | Access Token     | Refresh Token     |
| ----------- | ---------------- | ----------------- |
| Development | `devAccessToken` | `devRefreshToken` |
| Production  | `accessToken`    | `refreshToken`    |

환경변수로 커스텀 가능: `NEXT_PUBLIC_ACCESS_TOKEN_COOKIE_NAME` /
`NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME`. 미들웨어/JS는 두 이름 모두 후보로
탐색한다 (`ACCESS_TOKEN_COOKIE_CANDIDATES`).

---

## 에러 처리

### `normalizeApiError()` — `error.ts`

Axios 에러를 표준 형식으로 변환 (RSC + client 양쪽 안전):

```ts
interface NormalizedApiError {
  status?: number;
  message: string;
  code?: string;
}
```

> `axios.isAxiosError`를 쓰지 않고 객체 marker(`isAxiosError === true`)를
> 직접 검사한다 — Turbopack RSC 스캐너가 axios import 만으로도 모듈을
> client-only로 강제하기 때문.

### 상태 코드별 메시지

| 상태 코드 | 기본 메시지                                   |
| --------- | --------------------------------------------- |
| 400       | 잘못된 요청입니다.                            |
| 401       | 로그인이 필요하거나 세션이 만료되었습니다.    |
| 403       | 접근 권한이 없습니다.                         |
| 404       | 요청한 리소스를 찾을 수 없습니다.             |
| 408 / 504 | 요청/응답 시간이 초과되었습니다.              |
| 429       | 요청이 너무 많습니다.                         |
| 500-503   | 서버 오류 / 일시적 장애 메시지                |
| 네트워크  | 네트워크 연결을 확인한 뒤 다시 시도해 주세요. |

### `notifyApiError()` — `errorNotify.ts` (`'use client'`)

- Sonner toast로 에러 메시지 표시
- `WeakSet`으로 동일 에러 중복 알림 방지
- 302 redirect 에러는 토스트 생략
- 서버 메시지가 `internal server error` 인 경우 토스트 생략

### `handleAuthError()` — `errorNotify.ts`

- 401일 때만 동작
- `authStorage.clearTokens()` 호출, `1d1s:sidebar` localStorage 제거
- 보호 라우트(`/mypage`, `/challenge/{id}`, `/diary/{id}`, `*/create` 등)에서
  발생하면 `window.location.assign('/')`
