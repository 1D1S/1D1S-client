# 코드 컨벤션

---

## 파일 위치 규칙

| 코드 종류           | 위치                  |
| ------------------- | --------------------- |
| 라우트 / 페이지     | `src/app/`            |
| 도메인 기능         | `src/app.feature/`    |
| 공용 컴포넌트       | `src/app.component/`  |
| 핵심 모듈           | `src/app.module/`     |
| 전역 상수           | `src/app.constants/`  |
| 전역 스타일         | `src/app.styles/`     |
| RSC/client 공용 라이브러리 | `src/app.lib/` (font, Prefetch, getQueryClient) |

### 파일 확장자

| 확장자 | 용도            |
| ------ | --------------- |
| `.tsx` | React 컴포넌트  |
| `.ts`  | TypeScript 모듈 |

---

## Path Alias

| Alias          | 경로                    |
| -------------- | ----------------------- |
| `@/*`          | `./src/*`               |
| `@component/*` | `./src/app.component/*` |
| `@feature/*`   | `./src/app.feature/*`   |
| `@module/*`    | `./src/app.module/*`    |
| `@constants/*` | `./src/app.constants/*` |

> `app.lib/`는 별도 alias가 없으며 `@/app.lib/...`로 import 한다.

---

## 네이밍 규칙

### 파일명 (.tsx → PascalCase / .ts → camelCase)

| 종류     | 확장자 | 규칙                      | 예시                          |
| -------- | ------ | ------------------------- | ----------------------------- |
| 컴포넌트 | `.tsx` | PascalCase                | `ChallengeCard.tsx`           |
| Screen   | `.tsx` | PascalCase + `Screen`     | `ChallengeListScreen.tsx`     |
| 훅       | `.ts`  | `use` 접두사 + camelCase  | `useDiaryQueries.ts`          |
| API      | `.ts`  | camelCase + `Api`         | `diaryBoardApi.ts`            |
| 타입     | `.ts`  | camelCase                 | `challenge.ts`, `diary.ts`    |
| 상수/Query Key | `.ts` | camelCase             | `queryKeys.ts`, `categories.ts` |

예외:
- Next.js 규약 파일은 소문자: `page.tsx`, `layout.tsx`, `route.ts`,
  `loading.tsx`, `not-found.tsx`, `middleware.ts` 등
- 배럴 파일이 필요한 경우 `index.tsx` / `index.ts` 사용 (예:
  `app.module/providers/index.tsx`)

### 변수 / 함수

```ts
const userName = 'John';           // 변수: camelCase
const MAX_LENGTH = 1000;           // 상수: SCREAMING_SNAKE_CASE
const isActive = true;             // 불리언: is / has / should 접두사
function handleClick() {}          // 이벤트 핸들러: handle 접두사
function fetchData() {}            // 동작 함수: 동사로 시작
```

### 컴포넌트 / Props

```ts
// 컴포넌트: PascalCase (default export)
export default function ChallengeCard() {}

// Screen: Screen 역할 명시
export default function ChallengeListScreen() {}

// Props: 컴포넌트명 + Props 또는 짧게 Props
interface ChallengeCardProps { /* ... */ }
```

### Query Key Factory

```ts
// 도메인_QUERY_KEYS 형식 (대문자 + SCREAMING_SNAKE_CASE)
export const DIARY_QUERY_KEYS = {
  all: ['diaries'] as const,
  lists: () => [...DIARY_QUERY_KEYS.all, 'list'] as const,
  list: (params) => [...DIARY_QUERY_KEYS.lists(), params] as const,
  detail: (id) => [...DIARY_QUERY_KEYS.all, 'detail', id] as const,
};
```

---

## TypeScript

### 타입 정의

```ts
// ESLint에서 interface 사용 강제 (consistent-type-definitions)
interface User {
  id: string;
  name: string;
}

// 유틸리티 타입 활용
type UpdateInput = Partial<Omit<Challenge, 'id' | 'createdAt'>>;
type Summary = Pick<Challenge, 'id' | 'title'>;
```

### 타입 단언 지양

```ts
// 타입 단언 지양
const user = data as User;

// 타입 가드 사용 권장
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data
  );
}
```

### `any` 금지

- ESLint `no-explicit-any` warn + `fixToUnknown` 옵션 적용
- 불가피한 경우 `// eslint-disable-next-line` + 사유 주석 필수

---

## React 컴포넌트

### 구조 순서

```tsx
'use client'; // 최하위 리프 컴포넌트에만 (Screen은 상위 컴포넌트면 RSC 유지)

import { useCallback, useState } from 'react';

import { cn } from '@module/utils/cn';

interface Props {
  challenge: Challenge;
  onEdit?: (id: string) => void;
}

export default function ChallengeCard({
  challenge,
  onEdit,
}: Props) {
  // 1. 외부 훅 (useRouter, useQuery 등)
  // 2. 상태 (useState)
  // 3. Ref (useRef)
  // 4. 파생 상태 (useMemo)
  // 5. 이펙트 (useEffect) <- 데이터 페칭 금지
  // 6. 콜백 (useCallback)

  const handleClick = useCallback(() => {
    onEdit?.(challenge.id);
  }, [onEdit, challenge.id]);

  return (
    <article className="p-4">
      <h2>{challenge.title}</h2>
    </article>
  );
}
```

### 조건부 렌더링

```tsx
// 단순 조건
{isVisible && <Modal />}

// 이항 조건
{isLoading ? <Skeleton /> : <Content />}

// Early return
if (loading) return <Loading />;
return <Content />;

// 중첩 삼항 금지
{a ? (b ? <X /> : <Y />) : <Z />}
```

### 리스트 렌더링

```tsx
// 고유 key 사용
{posts.map((post) => <Card key={post.id} />)}

// index를 key로 사용 금지
{posts.map((_, i) => <Card key={i} />)}
```

---

## 스타일링

> 상세 규칙: `docs/ai/TAILWIND_STYLING_GUIDE.md`

```tsx
// 80자 이하 정적 문자열 -> cn() 금지
className="flex items-center gap-2"

// cn()은 복수 인수 또는 조건부 클래스에만 사용
className={cn(
  'flex',
  isActive && 'bg-main-500',
  className,
)}

// 80자를 넘는 경우 -> cn()으로 분리 (불변량 #8)
className={cn(
  'flex w-full items-center justify-between',
  'border-b border-gray-200 px-4 py-2',
)}
```

---

## Import 정렬 (simple-import-sort)

ESLint `simple-import-sort` 플러그인이 자동 정렬합니다.

```ts
// 1. 외부 라이브러리
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. 내부 모듈 (@alias)
import { apiClient } from '@module/api/client';
import { cn } from '@module/utils/cn';

// 3. @/app.lib 등 다른 alias 그룹
import { Prefetch } from '@/app.lib/Prefetch';

// 4. 같은 feature 내 상대 경로
import { DIARY_QUERY_KEYS } from '../consts/queryKeys';
import type { Diary } from '../type/diary';
```

`import/first`, `import/newline-after-import`, `import/no-duplicates`도 함께
강제된다.

---

## 코드 품질 기준

| 항목              | 기준                                       |
| ----------------- | ------------------------------------------ |
| 들여쓰기          | 스페이스 2칸                               |
| 최대 줄 길이      | 80자 (ESLint `max-len` error)              |
| 따옴표            | 단일 따옴표 (`quotes: single`)             |
| 세미콜론          | 필수 (`semi: always`)                      |
| 함수 스타일       | 선언식 + 화살표 허용 (`func-style`)        |
| 배열 타입         | `T[]` (단순) / `ReadonlyArray<T>` (readonly) |
| 타입 정의         | `interface` 강제                           |
| `var`             | 금지 (`no-var`)                            |
| `const` 선호      | `prefer-const`                             |
| `parseInt`/`parseFloat` | `Number()` 사용 (no-restricted-globals) |
| 포맷팅            | Prettier (printWidth 80, trailingComma es5) |
| 린트              | ESLint `--max-warnings=0` (CI는 -1 = 모두 fail) |
| 커밋              | Conventional Commits 형식                  |
| 미사용 파일/export | Knip 통과 (`pnpm knip`)                    |
