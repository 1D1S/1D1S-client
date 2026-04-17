# 개발 가이드

---

## 초기 설정

```bash
# 저장소 클론 후
nvm install && nvm use
pnpm install
pnpm init:local-dns
```

- 로컬 실행은 HTTPS 기반: `pnpm init:local-dns`로 로컬 DNS + 인증서 설정
- 별도 인증서만 필요 시: `pnpm init-local-cert`

### 주요 환경변수 (`.env`)

```bash
NEXT_PUBLIC_ODOS_API_URL=           # API 베이스 URL
NEXT_PUBLIC_ODOS_IMAGE_URL=         # 이미지 CDN URL
NEXT_PUBLIC_ODOS_IMAGE_BASE_URL=    # 이미지 베이스 URL
NEXT_PUBLIC_ACCESS_TOKEN_COOKIE_NAME=  # 쿠키 이름 (선택)
NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME= # 쿠키 이름 (선택)
```

---

## 명령어

```bash
pnpm dev                  # 개발 서버 실행 (로컬 DNS + HTTPS)
pnpm dev:next             # Next.js 개발 서버만 실행
pnpm build                # 프로덕션 빌드
pnpm start                # 프로덕션 서버 실행
pnpm start:localias       # 로컬 프로덕션 서버 (도메인 기반)
pnpm lint                 # ESLint 검사
pnpm clean                # node_modules + .next 삭제 후 재설치
```

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

---

## 신규 기능 개발 순서

### 1. Feature 모듈 생성

```
src/app.feature/new-feature/{submodule}/
├── screen/NewFeatureScreen.tsx     <- 진입점
├── components/FeatureContent.tsx
├── hooks/useFeatureQueries.ts
├── api/featureApi.ts
├── type/feature.ts
└── consts/queryKeys.ts
```

### 2. API 함수 작성

```ts
// src/app.feature/new-feature/api/featureApi.ts
import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';
import type { Feature } from '../type/feature';

export async function getFeatureList(
  params: FeatureListParams,
) {
  return requestData<Feature[]>(
    apiClient.get('/features', { params }),
  );
}

export async function createFeature(
  body: CreateFeatureBody,
) {
  return requestData<Feature>(
    apiClient.post('/features', body),
  );
}
```

### 3. Query Key Factory 정의

```ts
// src/app.feature/new-feature/consts/queryKeys.ts
export const FEATURE_QUERY_KEYS = {
  all: ['features'] as const,
  lists: () =>
    [...FEATURE_QUERY_KEYS.all, 'list'] as const,
  list: (params: FeatureListParams) =>
    [...FEATURE_QUERY_KEYS.lists(), params] as const,
  detail: (id: string) =>
    [...FEATURE_QUERY_KEYS.all, 'detail', id] as const,
};
```

### 4. TanStack Query 훅 작성

```ts
// src/app.feature/new-feature/hooks/useFeatureQueries.ts
import { useQuery, useInfiniteQuery }
  from '@tanstack/react-query';
import { getFeatureList } from '../api/featureApi';
import { FEATURE_QUERY_KEYS } from '../consts/queryKeys';

export function useFeatureList(params: FeatureListParams) {
  return useInfiniteQuery({
    queryKey: FEATURE_QUERY_KEYS.list(params),
    queryFn: ({ pageParam = 0 }) =>
      getFeatureList({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext
        ? lastPage.page + 1
        : undefined,
  });
}
```

### 5. Mutation 훅 작성

```ts
// src/app.feature/new-feature/hooks/useFeatureMutations.ts
import { useMutation, useQueryClient }
  from '@tanstack/react-query';
import { createFeature } from '../api/featureApi';
import { FEATURE_QUERY_KEYS } from '../consts/queryKeys';

export function useCreateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEATURE_QUERY_KEYS.lists(),
      });
    },
  });
}
```

### 6. Screen 컴포넌트 작성

```ts
// src/app.feature/new-feature/screen/NewFeatureScreen.tsx
'use client';

import FeatureContent from '../components/FeatureContent';
import { useFeatureList } from '../hooks/useFeatureQueries';

export default function NewFeatureScreen() {
  const { data, isLoading } = useFeatureList(params);

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-4">
      <FeatureContent data={data} />
    </div>
  );
}
```

### 7. 페이지 라우트 추가

```ts
// src/app/new-feature/page.tsx
import NewFeatureScreen
  from '@feature/new-feature/screen/NewFeatureScreen';

export default function NewFeaturePage() {
  return <NewFeatureScreen />;
}

export function generateMetadata() {
  return { title: '새 기능' };
}
```

---

## 폼 개발 (React Hook Form + Zod)

### 스키마 정의

```ts
import { z } from 'zod';

export const featureSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(50, '50자 이내로 입력해주세요'),
  category: z.enum(
    ['DEV', 'EXERCISE', 'BOOK'],
    { required_error: '카테고리를 선택해주세요' },
  ),
  description: z.string().max(200).optional(),
});

export type FeatureFormData = z.infer<typeof featureSchema>;
```

### 폼 훅 사용

```ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  featureSchema,
  type FeatureFormData,
} from '../type/featureSchema';

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
- 공용 로직 -> `app.module/` / `app.lib/`
- 환경값 -> `.env` 관리, **절대 커밋 금지**
- 디자인 시스템 컴포넌트는 `@1d1s/design-system`에서 import
- 커스텀 UI 컴포넌트는 `app.component/`에 배치

---

## 트러블슈팅

| 문제                       | 해결                                              |
| -------------------------- | ------------------------------------------------- |
| HTTPS 인증서 문제          | `pnpm init:local-dns` 재실행                      |
| 의존성 충돌                | `pnpm clean` (node_modules + .next 삭제 후 재설치) |
| 타입 에러                  | `rm -rf .next && pnpm dev`                         |
| API 연결 실패              | `.env`의 `NEXT_PUBLIC_ODOS_API_URL` 확인           |
| 토큰 갱신 무한 루프        | `interceptors.ts`의 `_retry` 플래그 확인           |

---

## PR 작성 규칙

- 변경 요약 간결히 작성
- 이슈/티켓 링크 첨부 (있는 경우, Notion ODS-* 형식)
- UI 변경 시 스크린샷 또는 영상 필수
- 검증 방법 명시 (예: `pnpm dev`에서 확인, `pnpm lint` 통과)

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
