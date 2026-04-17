# API

---

## 개요

| 방식 | 용도                          | 클라이언트          |
| ---- | ----------------------------- | ------------------- |
| REST | 모든 데이터 CRUD + 인증       | Axios (4개 인스턴스) |

---

## Axios 클라이언트

### 설정 파일 위치

```
src/app.module/api/
├── client.ts          # Axios 인스턴스 생성
├── interceptors.ts    # 토큰 갱신 인터셉터
├── error.ts           # 에러 정규화 + 알림
├── request.ts         # requestData, requestBody 헬퍼
├── types.ts           # ApiResponse, NormalizedApiError 타입
└── config.ts          # API_BASE_URL 설정
```

### 인스턴스 종류

| 인스턴스          | 용도                          | 인증 | 401 처리         |
| ----------------- | ----------------------------- | ---- | ---------------- |
| `apiClient`       | 메인 API 호출                 | O    | 토큰 갱신 + 리다이렉트 |
| `publicApiClient` | 비인증 엔드포인트             | X    | 리다이렉트 없음  |
| `tokenClient`     | 토큰 갱신 전용                | X    | 없음 (순환 방지) |
| `silentAuthClient`| 선택적 인증 요청              | O    | 401 -> null 반환 |

### 인터셉터 흐름

```
API 요청
  -> Response Interceptor
    -> 302 감지 -> 세션 만료 -> 토큰 갱신 시도
    -> 401 감지 -> refreshToken으로 갱신
      ├── 성공 -> 새 토큰으로 원래 요청 재시도
      └── 실패 -> 토큰 삭제 + 홈 리다이렉트
```

- 갱신 중 다른 요청은 **subscriber 큐**에 대기
- `_retry` 플래그로 무한 재시도 방지

---

## Request 헬퍼

```ts
import { requestData, requestBody }
  from '@module/api/request';

// requestData: response.data.data 추출
const challenges = await requestData<Challenge[]>(
  apiClient.get('/challenges', { params })
);

// requestBody: response.data 전체 반환
const response = await requestBody<ApiResponse>(
  apiClient.post('/challenges', body)
);

// buildQueryString: URLSearchParams 생성
const qs = buildQueryString({
  page: 1,
  size: 20,
  categories: ['DEV', 'EXERCISE'],
});
// -> "page=1&size=20&categories=DEV&categories=EXERCISE"
```

---

## TanStack Query 패턴

### Query Key Factory

```ts
// src/app.feature/diary/board/consts/queryKeys.ts
export const DIARY_QUERY_KEYS = {
  all: ['diaries'] as const,
  lists: () =>
    [...DIARY_QUERY_KEYS.all, 'list'] as const,
  list: (params: DiaryListParams) =>
    [...DIARY_QUERY_KEYS.lists(), params] as const,
  detail: (id: string) =>
    [...DIARY_QUERY_KEYS.all, 'detail', id] as const,
  comments: () =>
    [...DIARY_QUERY_KEYS.all, 'comments'] as const,
};
```

### Query 사용

```ts
// hooks/useDiaryQueries.ts
export function useDiaryList(params: DiaryListParams) {
  return useInfiniteQuery({
    queryKey: DIARY_QUERY_KEYS.list(params),
    queryFn: ({ pageParam = 0 }) =>
      getDiaryList({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
}

export function useDiaryDetail(id: string) {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.detail(id),
    queryFn: () => getDiaryDetail(id),
  });
}
```

### Mutation 사용

```ts
// hooks/useDiaryMutations.ts
export function useCreateDiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDiary,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DIARY_QUERY_KEYS.lists(),
      });
    },
  });
}
```

### Fetch Policy (QueryClient 기본값)

```ts
// src/app.lib/get-query-client.ts
defaultOptions: {
  queries: {
    staleTime: 60 * 1000,        // 60초
    retry: (failureCount, error) => {
      if (is4xxError(error)) return false; // 4xx 재시도 안 함
      return failureCount < 2;
    },
  },
}
```

---

## 서버 사이드 프리페치

```ts
// src/app.lib/prefetch.tsx
import { Prefetch, PrefetchQuery } from '@/app.lib/prefetch';

// 단일 쿼리 프리페치
export default async function Page() {
  return (
    <PrefetchQuery
      queryKey={DIARY_QUERY_KEYS.list(params)}
      queryFn={() => getDiaryList(params)}
    >
      <DiaryListScreen />
    </PrefetchQuery>
  );
}

// 복수 쿼리 프리페치
export default async function Page() {
  return (
    <Prefetch
      queries={[
        { queryKey: KEY_A, queryFn: fnA },
        { queryKey: KEY_B, queryFn: fnB },
      ]}
    >
      <ScreenComponent />
    </Prefetch>
  );
}
```

---

## REST API Routes

### 엔드포인트 (Next.js API Routes)

| 경로          | 메서드 | 설명             |
| ------------- | ------ | ---------------- |
| `/api/*`      | 다양   | 프록시/내부 API  |

---

## 인증 (토큰)

### 저장 방식

| 저장소            | 용도                                |
| ----------------- | ----------------------------------- |
| HTTP-Only Cookie  | Access Token, Refresh Token (백엔드 관리) |
| localStorage      | 인증 상태 플래그 (`auth_authenticated`) |
| 도메인 공유 Cookie | 서브도메인 간 인증 힌트 (`.1day1streak.com`) |

### 토큰 갱신 흐름

```
API 요청
  -> 401 / 302 에러
  -> interceptor 감지
  -> tokenClient로 refresh 요청
    ├── 성공 -> 새 토큰 설정 + 원래 요청 재시도
    └── 실패 -> authStorage.clearTokens() + 홈 리다이렉트
```

### Cookie 이름

| 환경        | Access Token         | Refresh Token         |
| ----------- | -------------------- | --------------------- |
| Development | `devAccessToken`     | `devRefreshToken`     |
| Production  | `accessToken`        | `refreshToken`        |

환경변수로 커스텀 가능: `NEXT_PUBLIC_ACCESS_TOKEN_COOKIE_NAME`, `NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME`

---

## 에러 처리

### `normalizeApiError()`

Axios 에러를 표준 형식으로 변환:

```ts
type NormalizedApiError = {
  status: number;
  message: string;
  code?: string;
};
```

### 상태 코드별 메시지

| 상태 코드 | 기본 메시지                   |
| --------- | ----------------------------- |
| 400       | 잘못된 요청입니다             |
| 401       | 인증이 필요합니다             |
| 403       | 접근 권한이 없습니다          |
| 404       | 요청한 리소스를 찾을 수 없습니다 |
| 429       | 요청이 너무 많습니다          |
| 5xx       | 서버 오류가 발생했습니다      |

### `notifyApiError()`

- Sonner toast로 에러 메시지 표시
- `WeakSet`으로 동일 에러 중복 알림 방지

### `handleAuthError()`

- `authStorage.clearTokens()` 호출
- 보호 라우트에서 발생 시 홈(`/`)으로 리다이렉트
