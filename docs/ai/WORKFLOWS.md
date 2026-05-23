# CI/CD & 워크플로우

---

## GitHub Actions 워크플로우

### CI Check (`.github/workflows/ci.yml`)

**트리거**: push to `main`/`develop`, PR to `main`/`develop`

**건너뛰기 조건**: 레포가 `NOGUEN/1D1S-client` (포크)인 경우 전체 잡 skip

| 잡             | 내용                           | 조건              |
| -------------- | ------------------------------ | ----------------- |
| **Lint**       | `eslint . --max-warnings=-1`   | 항상 실행         |
| **TypeScript** | `pnpm tsc --noEmit`            | 항상 실행         |
| **Knip**       | `pnpm knip --reporter=compact` | 항상 실행         |
| **Build**      | `pnpm build`                   | 위 3개 잡 통과 시 |

모든 잡은 동일한 setup을 사용한다:

1. `actions/checkout@v4`
2. `pnpm/action-setup@v4`
3. `actions/setup-node@v4` (Node 20, pnpm 캐시)
4. `pnpm install --frozen-lockfile`

**Build 환경변수**: `NEXT_PUBLIC_ODOS_API_URL=https://dev.api.1day1streak.com/`

---

### Discord PR 알림 (`discord-pr-notification.yml`)

**트리거**: `pull_request` — `opened` / `closed` / `edited` / `synchronize`

- PR 정보를 Discord 프론트엔드 채널에 자동 알림
- PR 제목, 본문 미리보기, 작성자, 브랜치 정보 포함
- Discord 스레드 생성으로 토론 가능
- 프론트엔드 역할 태그로 가시성 확보

---

### 기타 워크플로우

| 워크플로우                 | 설명                          |
| -------------------------- | ----------------------------- |
| `push-to-fork.yml`         | 포크 레포로 자동 push         |
| `update_notion-status.yml` | Notion DB에 PR 상태 업데이트  |
| `pr-automation.yml`        | 리뷰어 자동 배정, 라벨 자동화 |

---

## ESLint 설정 (`eslint.config.mjs`)

베이스: `eslint-config-next`, `typescript-eslint/recommended`, `prettier`.
플러그인: `import`, `simple-import-sort`, `tailwindcss`.

### 주요 규칙

| 규칙                                                      | 수준  | 내용                                          |
| --------------------------------------------------------- | ----- | --------------------------------------------- |
| `max-len`                                                 | error | 80자 제한 (import 줄과 주석/URL 등 일부 예외) |
| `simple-import-sort/imports`/`exports`                    | error | 그룹 기반 자동 정렬                           |
| `import/first` / `newline-after-import` / `no-duplicates` | error | import 그룹 형식 강제                         |
| `tailwindcss/classnames-order`                            | warn  | 클래스 순서 정렬                              |
| `tailwindcss/no-contradicting-classname`                  | error | 충돌 클래스 금지                              |
| `tailwindcss/enforces-shorthand`                          | warn  | 축약형 권장 (`border-y` 등)                   |
| `tailwindcss/no-custom-classname`                         | off   | 커스텀 클래스 허용                            |
| `@typescript-eslint/consistent-type-definitions`          | error | `interface` 강제                              |
| `@typescript-eslint/array-type`                           | error | `T[]` (단순) / `ReadonlyArray<T>`             |
| `@typescript-eslint/no-explicit-any`                      | warn  | `fixToUnknown` 적용                           |
| `@typescript-eslint/explicit-function-return-type`        | warn  | 표현식/타입드 함수는 예외                     |
| `@typescript-eslint/ban-ts-comment`                       | warn  | `// @ts-ignore` 시 5자 이상 설명 필요         |
| `@typescript-eslint/method-signature-style`               | error | `method` 시그니처 형태                        |
| `@typescript-eslint/explicit-member-accessibility`        | error | `no-public` (public 키워드 금지)              |
| `no-var`                                                  | error | `var` 금지                                    |
| `prefer-const`                                            | error | 가능한 경우 `const`                           |
| `quotes`                                                  | error | single quotes (`avoidEscape`)                 |
| `semi`                                                    | error | 세미콜론 필수                                 |
| `curly`                                                   | error | 모든 분기에 블록 사용                         |
| `eqeqeq`                                                  | error | `===` 강제 (null만 예외)                      |
| `no-restricted-globals`                                   | error | `parseInt`, `parseFloat` 금지                 |
| `func-style`                                              | error | 선언식 + 화살표 허용                          |
| `arrow-body-style`                                        | error | `as-needed`                                   |
| `prefer-template`                                         | error | 문자열 연결 대신 템플릿 리터럴                |
| `id-length`                                               | warn  | 최소 2자 (i, j, k, x, y, \_ 예외)             |
| `react/jsx-no-useless-fragment`                           | warn  | 불필요한 Fragment 금지                        |

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

## Knip (Dead Code 검사)

`knip.config.ts`로 진입점/대상/예외를 관리한다.

- **진입점**: `src/app/**/page|layout|not-found|route`, 미들웨어,
  Next/Postcss 설정
- **대상**: `src/**/*.{ts,tsx}`
- **CI 정책**: 이슈 발견 시 실패. baseline은 `ignore` 배열로 관리하고,
  신규 발생만 차단한다. 기존 항목은 `docs/ai/TECH_DEBT.md` Minor 후보로
  분류.

```bash
pnpm knip                 # 사람이 읽기 좋은 출력
pnpm knip:report          # JSON
pnpm knip --reporter=compact   # CI와 동일
```

---

## Husky & CommitLint

### Git Hooks

| Hook         | 동작                                                   |
| ------------ | ------------------------------------------------------ |
| `pre-commit` | lint-staged (현재 비활성화 — `.husky/pre-commit` 참고) |
| `commit-msg` | CommitLint 검증                                        |
| `prepare`    | `husky` 설치 (package.json scripts)                    |

### CommitLint 규칙

- `@commitlint/config-conventional` 기반
- 허용 타입: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

---

## 로컬 검증 명령어

```bash
# 린트
pnpm lint

# 타입 검사
pnpm exec tsc --noEmit

# Dead code 검사
pnpm knip

# 빌드
pnpm build

# 전체 검증 (CI와 동일)
pnpm lint && pnpm exec tsc --noEmit && pnpm knip --reporter=compact && pnpm build
```
