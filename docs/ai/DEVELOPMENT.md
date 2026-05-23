# 개발 가이드

---

## 초기 설정

```bash
# 저장소 클론 후
nvm install && nvm use      # Node 20+
pnpm install
pnpm init:local-dns         # hosts 등록 + 로컬 HTTPS 인증서
```

- 로컬 실행은 HTTPS 기반이며 `local.dev.1day1streak.com`을 사용한다.
- 인증서만 다시 만들고 싶다면 `pnpm init-local-cert`.
- 본 프로젝트는 **`.env.local`을 사용하지 않는다**. 모든 환경값은 `.env`로
  관리한다 (dev script가 source 함).

### 주요 환경변수 (`.env`)

```bash
NEXT_PUBLIC_ODOS_API_URL=                # API 베이스 URL (예: https://dev.api.1day1streak.com/)
NEXT_PUBLIC_ODOS_IMAGE_URL=              # 이미지 CDN URL
NEXT_PUBLIC_ODOS_IMAGE_BASE_URL=         # 이미지 베이스 URL
NEXT_PUBLIC_WEB_URL=                     # 사이트 URL (메타데이터/OG)
NEXT_PUBLIC_SITE_URL=                    # WEB_URL 폴백
NEXT_PUBLIC_ACCESS_TOKEN_COOKIE_NAME=    # 쿠키 이름 오버라이드 (선택)
NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME=   # 쿠키 이름 오버라이드 (선택)
```

---

## 명령어

```bash
pnpm dev                  # 로컬 DNS + HTTPS 부트스트랩 + 개발 서버
pnpm dev:next             # Next.js 개발 서버만 실행 (HTTPS 없이)
pnpm build                # 프로덕션 빌드
pnpm start                # 프로덕션 서버 실행
pnpm start:localias       # 로컬 도메인 기반 프로덕션 서버 (dev-server.js)
pnpm lint                 # ESLint 검사 (src 대상)
pnpm knip                 # 미사용 파일/export 탐지
pnpm knip:report          # Knip 결과를 JSON 으로 출력
pnpm clean                # node_modules + .next 삭제 후 재설치
```

타입 검사는 `pnpm exec tsc --noEmit` 으로 별도 실행.

---

## 커밋 컨벤션

Conventional Commits 형식 (CommitLint 검증):

```
type: 요약
```

| type       | 사용 시점       |
| ---------- | --------------- |
| `feat`     | 새 기능 추가    |
| `fix`      | 버그 수정       |
| `refactor` | 리팩토링        |
| `chore`    | 설정, 빌드 변경 |
| `docs`     | 문서 수정       |
| `style`    | 코드 포맷팅     |
| `test`     | 테스트          |
| `ci`       | CI/CD 변경      |

예시: `feat: 챌린지 작성 폼 추가`, `fix: 토큰 갱신 오류 수정`

> Claude 트레일러(Co-Authored-By 등)는 커밋 메시지에 넣지 않는다.

---

## 신규 기능 개발 순서

### 1. Feature 모듈 생성

```
src/app.feature/new-feature/{submodule}/
├── screen/NewFeatureScreen.tsx     <- 진입점 (PascalCase)
├── components/FeatureContent.tsx
├── hooks/useFeatureQueries.ts
├── hooks/useFeatureMutations.ts
├── api/featureApi.ts
├── type/feature.ts
└── consts/queryKeys.ts
```

> 사용하는 디렉토리만 두면 된다. 모두 만들 필요 없음.

### 2. API 함수 작성

```ts
// src/app.feature/new-feature/api/featureApi.ts
import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import type { Feature, FeatureListParams } from '../type/feature';

export async function getFeatureList(
  params: FeatureListParams
): Promise<Feature[]> {
  return requestData<Feature[]>(apiClient, {
    url: '/features',
    method: 'GET',
    params,
  });
}

export async function createFeature(body: CreateFeatureBody): Promise<Feature> {
  return requestData<Feature>(apiClient, {
    url: '/features',
    method: 'POST',
    data: body,
  });
}
```

### 3. Query Key Factory 정의

```ts
// src/app.feature/new-feature/consts/queryKeys.ts
import type { FeatureListParams } from '../type/feature';

export const FEATURE_QUERY_KEYS = {
  all: ['features'] as const,
  lists: () => [...FEATURE_QUERY_KEYS.all, 'list'] as const,
  list: (params: FeatureListParams) =>
    [...FEATURE_QUERY_KEYS.lists(), params] as const,
  details: () => [...FEATURE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...FEATURE_QUERY_KEYS.details(), id] as const,
};
```

### 4. TanStack Query 훅 작성

```ts
// src/app.feature/new-feature/hooks/useFeatureQueries.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getFeatureList } from '../api/featureApi';
import { FEATURE_QUERY_KEYS } from '../consts/queryKeys';
import type { FeatureListParams } from '../type/feature';

export function useFeatureList(params: FeatureListParams) {
  return useInfiniteQuery({
    queryKey: FEATURE_QUERY_KEYS.list(params),
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      getFeatureList({ ...params, cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.nextCursor : undefined,
  });
}
```

### 5. Mutation 훅 작성

```ts
// src/app.feature/new-feature/hooks/useFeatureMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateAll } from '@module/api/queryInvalidation';

import { createFeature } from '../api/featureApi';
import { FEATURE_QUERY_KEYS } from '../consts/queryKeys';

export function useCreateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFeature,
    onSuccess: () => {
      invalidateAll(queryClient, [FEATURE_QUERY_KEYS.lists()]);
    },
  });
}
```

### 6. Screen 컴포넌트 작성

```tsx
// src/app.feature/new-feature/screen/NewFeatureScreen.tsx
'use client';

import FeatureContent from '../components/FeatureContent';
import { useFeatureList } from '../hooks/useFeatureQueries';

export default function NewFeatureScreen() {
  const { data, isPending } = useFeatureList({ size: 20 });

  if (isPending) {
    return <FeatureSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <FeatureContent data={data} />
    </div>
  );
}
```

### 7. 페이지 라우트 + RSC Prefetch

```tsx
// src/app/new-feature/page.tsx
import { Suspense } from 'react';

import NewFeatureScreen from '@feature/new-feature/screen/NewFeatureScreen';
import { FEATURE_QUERY_KEYS } from '@feature/new-feature/consts/queryKeys';

import { Prefetch } from '@/app.lib/Prefetch';
import { getServerFeatureList } from '@module/api/serverApi';

export const metadata = { title: '새 기능' };

export default function NewFeaturePage() {
  return (
    <Suspense fallback={<FeatureSkeleton />}>
      <Prefetch
        queries={[
          {
            type: 'infinite',
            queryKey: FEATURE_QUERY_KEYS.list({ size: 20 }),
            initialPageParam: undefined,
            queryFn: () => getServerFeatureList({ size: 20 }),
          },
        ]}
      >
        <NewFeatureScreen />
      </Prefetch>
    </Suspense>
  );
}
```

---

## 폼 개발 (React Hook Form + Zod)

### 스키마 정의

```ts
import { z } from 'zod';

export const featureSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(50, '50자 이내로 입력해주세요'),
  category: z.enum(['DEV', 'EXERCISE', 'BOOK'], {
    required_error: '카테고리를 선택해주세요',
  }),
  description: z.string().max(200).optional(),
});

export type FeatureFormData = z.infer<typeof featureSchema>;
```

### 폼 훅 사용

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { featureSchema, type FeatureFormData } from '../type/featureSchema';

export function useFeatureForm() {
  return useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
    },
  });
}
```

---

## 코드 작성 주의사항

- 새 파일은 기존 모듈 경계 안에 배치
- 공용 로직 -> `app.module/` (사이드이펙트 있는 모듈) 또는 `app.lib/` (RSC/client 공용)
- 환경값 -> `.env` 관리, **절대 커밋 금지**
- 디자인 시스템 컴포넌트는 `@1d1s/design-system`에서 import
- 커스텀 UI 컴포넌트는 `app.component/`에 배치
- `axios`는 RSC에서 사용하지 않는다 — `serverApi.ts`의 fetch 기반 헬퍼 사용

---

## 트러블슈팅

| 문제                           | 해결                                                          |
| ------------------------------ | ------------------------------------------------------------- |
| HTTPS 인증서 문제              | `pnpm init:local-dns` 재실행                                  |
| `.env.local` 사용 시 실행 실패 | `.env.local`은 차단됨, `.env` 만 사용                         |
| 의존성 충돌                    | `pnpm clean` (node_modules + .next 삭제 후 재설치)            |
| 타입 캐시 꼬임                 | `rm -rf .next && pnpm dev`                                    |
| API 연결 실패                  | `.env`의 `NEXT_PUBLIC_ODOS_API_URL` 확인                      |
| 토큰 갱신 무한 루프            | `interceptors.ts`의 `_retry` 플래그 확인                      |
| Knip false positive            | `knip.config.ts`의 `ignoreDependencies` 또는 `ignore` 에 등록 |

---

## PR 작성 규칙

- 변경 요약 간결히 작성
- 이슈/티켓 링크 첨부 (있는 경우, Notion `ODS-*` 형식)
- UI 변경 시 스크린샷 또는 영상 필수
- 검증 방법 명시 (예: `pnpm dev`에서 확인, `pnpm lint` / `pnpm knip` 통과)

---

## IDE 설정 (VS Code 권장)

권장 확장: ESLint, Prettier, Tailwind CSS IntelliSense

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
