# CI/CD & 워크플로우

---

## GitHub Actions 워크플로우

### CI Check (`ci.yml`)

**트리거**: push to `main`/`develop`, PR to `main`/`develop`

**건너뛰기 조건**: 레포가 `NOGUEN/1D1S-client` (포크)인 경우

| 잡             | 내용                     | 조건            |
| -------------- | ------------------------ | --------------- |
| **Lint**       | ESLint (zero warnings)   | 항상 실행       |
| **TypeScript** | `pnpm tsc --noEmit`      | 항상 실행       |
| **Build**      | `pnpm build`             | Lint + TS 통과 시 |

#### Lint 잡 상세

1. `pnpm install --frozen-lockfile`
2. `pnpm lint` — ESLint 검사, 경고도 에러로 처리

#### TypeScript 잡 상세

1. `pnpm tsc --noEmit` — 타입 검사만 수행 (빌드 없이)

#### Build 잡 상세

1. Lint + TypeScript 잡 통과 후 실행
2. `pnpm build` — Next.js 프로덕션 빌드

---

### Discord PR 알림 (`discord-pr-notification.yml`)

**트리거**: `pull_request` — `opened` / `closed` / `edited` / `synchronize`

- PR 정보를 Discord 프론트엔드 채널에 자동 알림
- PR 제목, 본문 미리보기, 작성자, 브랜치 정보 포함
- Discord 스레드 생성으로 토론 가능
- 프론트엔드 역할 태그로 가시성 확보

---

### 기타 워크플로우

| 워크플로우                   | 설명                          |
| ---------------------------- | ----------------------------- |
| `push-to-fork.yml`          | 포크 레포로 자동 push          |
| `update_notion-status.yml`  | Notion DB에 PR 상태 업데이트   |
| `pr-automation.yml`         | 리뷰어 자동 배정, 라벨 자동화  |

---

## ESLint 설정 (`eslint.config.mjs`)

### 주요 규칙

| 규칙                          | 수준    | 내용                                  |
| ----------------------------- | ------- | ------------------------------------- |
| 줄 길이                       | warn    | 80자 제한                             |
| Import 정렬                   | error   | `simple-import-sort` 강제             |
| Tailwind 클래스 순서          | warn    | `tailwindcss/classnames-order`        |
| Tailwind 중복 클래스          | error   | `tailwindcss/no-contradicting-classname` |
| 타입 정의 형식                | error   | `interface` 사용 강제 (`consistent-type-definitions`) |
| `any` 타입                    | warn    | `no-explicit-any`                     |
| 함수 반환 타입                | warn    | `explicit-function-return-type`       |
| 미사용 변수                   | error   | `no-unused-vars` (args: none)         |
| React Hooks                   | error   | `rules-of-hooks`                      |
| React Hooks deps              | warn    | `exhaustive-deps`                     |
| `const` 선호                  | error   | `prefer-const`                        |
| `var` 금지                    | error   | `no-var`                              |

### Prettier 연동

```json
{
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "endOfLine": "lf",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Tailwind 클래스가 자동 정렬됩니다.

---

## Husky & CommitLint

### Git Hooks

| Hook       | 동작                           |
| ---------- | ------------------------------ |
| pre-commit | lint-staged (현재 비활성화)    |
| commit-msg | CommitLint 검증                |

### CommitLint 규칙

- `@commitlint/config-conventional` 기반
- 허용 타입: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

---

## 로컬 검증 명령어

```bash
# 린트 검사
pnpm lint

# 타입 검사
pnpm tsc --noEmit

# 빌드 검증
pnpm build

# 전체 검증 (CI와 동일)
pnpm lint && pnpm tsc --noEmit && pnpm build
```
