# 1D1S-Client — 프로젝트 하네스 (진입점)

> **이 파일은 목차입니다.** 상세 내용은 `docs/ai/` 하위 문서를 참조하세요.
> 에이전트는 이 파일을 먼저 읽고, 필요한 docs 문서를 선택적으로 로드합니다.

---

## 하네스 라우터

의도에 따라 아래 파이프라인 중 하나를 실행합니다.

| 커맨드                  | 설명                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| `/ods-feature {요청}`   | 신규 기능 개발 — Screen → Component → Hook 계층 준수              |
| `/ods-api {요청}`       | REST API 연동 작업 + TanStack Query 훅 생성                      |
| `/ods-refactor {요청}`  | 구조 개선, 성능 최적화, 중복 제거                                 |
| `/ods-review {요청}`    | 코드 리뷰 + `docs/ai/TECH_DEBT.md` Golden Principles 위반 스캔   |

---

## 하네스 사용 기준

### `/ods-feature`

- 사용: 신규 UI, 신규 사용자 플로우, 신규 API 연결, 신규 상태 추가
- 사용 안 함: 동작 변경 없는 단순 구조 정리, 코드 이동, 중복 제거
- 기본 목표: 사용자 기능을 완성하되 `Screen → Component → Hook` 계층 유지

### `/ods-api`

- 사용: API 함수 작성, TanStack Query 훅 작성, 타입 정의, Axios 호출부 작업
- 사용 안 함: 화면만 바꾸는 작업, API와 무관한 스타일 수정
- 기본 목표: API 호출부 + Query 훅 + 타입을 함께 맞추고 캐시 무효화까지 반영

### `/ods-refactor`

- 사용: 동작 변경 없는 구조 개선, 성능 개선, 중복 제거, 경계 재조정
- 사용 안 함: 새 요구사항 구현, UX 플로우 추가
- 기본 목표: 기존 동작을 유지하면서 구조/성능/가독성을 개선

### `/ods-review`

- 사용: 변경사항 코드 리뷰, 아키텍처 위반 점검, 기술 부채 후보 식별
- 사용 안 함: 구현 자체, 대규모 코드 수정
- 기본 목표: Findings 중심으로 위험도를 정리하고 후속 조치 여부를 결정
- 기본 출력 순서: `Findings -> Open Questions -> Change Summary`
- Findings가 없으면 `No findings`를 명시한다.

---

## 하네스별 기본 로드 문서

| 하네스          | 기본 로드 문서                                                                 |
| --------------- | ------------------------------------------------------------------------------ |
| `/ods-feature`  | `docs/ai/ARCHITECTURE.md`, `docs/ai/CONVENTIONS.md`, `docs/ai/DEVELOPMENT.md` |
| `/ods-api`      | `docs/ai/API.md`, `docs/ai/DEVELOPMENT.md`, `docs/ai/CONVENTIONS.md`          |
| `/ods-refactor` | `docs/ai/ARCHITECTURE.md`, `docs/ai/CONVENTIONS.md`, 필요 시 `docs/ai/TAILWIND_STYLING_GUIDE.md` |
| `/ods-review`   | `docs/ai/ARCHITECTURE.md`, `docs/ai/CONVENTIONS.md`, `docs/ai/WORKFLOWS.md`   |

상황에 따라 `docs/ai/ROUTE_ACCESS_POLICY.md`와
`docs/ai/BRANCH_RELEASE_POLICY.md`를 추가 로드한다.
리뷰 범위가 구조적 문제까지 포함되면 `docs/ai/TECH_DEBT.md`도 함께 로드한다.

---

## 하네스별 완료 기준

### `/ods-feature`

- 사용자 요청 범위가 실제 화면/동작에 반영되어야 한다.
- `Screen -> Component -> Hook` 계층을 지켜야 한다.
- 필요 시 metadata, 접근 권한, 로딩/에러 상태까지 포함한다.
- 최소 `pnpm lint` 기준으로 검증한다.

### `/ods-api`

- API 함수, TanStack Query 훅, 타입 사용처가 함께 맞아야 한다.
- Query Key Factory 패턴을 준수해야 한다.
- 캐시 무효화 전략이 명확해야 한다.
- 최소 `pnpm lint` 기준으로 검증한다.

### `/ods-refactor`

- 사용자 관점의 동작 변화가 없어야 한다.
- 동작 변화가 불가피하면 변경 이유와 영향 범위를 먼저 명시한다.
- 제거한 중복, 개선한 경계, 기대 성능 효과를 설명할 수 있어야 한다.
- 최소 `pnpm lint` 기준으로 검증한다.

### `/ods-review`

- Findings를 먼저 제시한다.
- 심각도 순서로 정렬하고 파일/라인 근거를 포함한다.
- 왜 문제인지와 사용자 영향 또는 회귀 위험을 함께 설명한다.
- 지금 고치지 않을 구조적 문제는 기술 부채 후보로 분류한다.
- Findings 형식은 `P1 / P2 / P3`를 사용한다.
- 각 Finding은 아래 4가지를 포함한다:
  - 무엇이 문제인지
  - 어떤 조건에서 드러나는지
  - 왜 이번 변경으로 생겼는지
  - 사용자 또는 운영 영향이 무엇인지
- Open Questions는 실제로 merge 판단을 막는 항목만 남긴다.
- Change Summary는 Findings가 끝난 뒤 짧게 요약한다.
- 리뷰 결과가 단순 취향 차이이면 Findings로 올리지 않는다.
- 현재 PR에서 바로 고치지 않을 구조적 문제는 아래 조건일 때만
  기술 부채 후보로 남긴다:
  - 반복적으로 재발하는 패턴일 때
  - scope 밖이지만 영향이 명확할 때
  - owner 또는 후속 액션을 적을 수 있을 때

---

## `/ods-review` 출력 예시

```md
**Findings**

- [P1] 토큰 갱신 실패 시 무한 리다이렉트 — `src/app.module/api/interceptors.ts:42`
  현재 refresh 실패 시 홈으로 리다이렉트하는데, 홈에서도 인증 요청이
  발생하면 동일 조건에서 반복 리다이렉트가 발생합니다. 세션 만료 사용자는
  실제로 페이지에 진입하지 못할 수 있습니다.

- [P2] Query Key 불일치로 캐시 무효화 누락 — `src/app.feature/diary/write/hooks/use-diary-mutations.ts:28`
  `invalidateQueries`에 사용된 key가 `DIARY_QUERY_KEYS.lists()`와
  다릅니다. 일지 작성 후 목록이 갱신되지 않아 사용자가 새로고침을
  해야 할 수 있습니다.

**Open Questions**

- 이 변경이 기존 토큰 갱신 흐름에 영향을 주는지 확인이 필요합니다.

**Change Summary**

- 토큰 갱신과 캐시 무효화 로직에서 회귀 가능성이 보입니다.
- merge 전 P1은 수정 권장, P2는 같은 PR에서 같이 정리하는 편이 안전합니다.
```

리뷰 결과가 없으면 아래처럼 명시한다.

```md
**Findings**

- No findings.

**Residual Risks**

- 자동 테스트가 없어 런타임 회귀는 남아 있을 수 있습니다.
```

---

## 아키텍처 불변량 (위반 금지)

1. `'use client'`는 **최하위 리프** 컴포넌트에만 배치한다.
2. 데이터 페칭은 **`useEffect` 금지** — RSC, TanStack Query(`useQuery`, `useInfiniteQuery`, `useMutation`)만 허용.
3. 신규 UI는 **`Screen -> Component -> Hook`** 계층을 반드시 따른다.
4. TypeScript `any` 사용 금지 — 불가피한 경우 `// eslint-disable` + 사유 주석 필수.
5. API 타입 변경 시 **Query Key Factory와 훅을 즉시 동기화**.
6. `.env` 파일은 **절대 커밋 금지**.
7. 한 줄에 80자를 넘지 않는다. 불가피하게 넘어야 하는 경우 `// eslint-disable-next-line max-len` + 사유 주석 필수. 문서 파일에는 해당 안 함.
8. `className` 값이 포함된 줄이 80자를 넘으면 **반드시 `cn()`으로 분리**한다 — 인라인 문자열 연결/템플릿 리터럴 사용 금지.
9. `cn()`은 **복수 인수 또는 조건부 클래스**에만 사용한다 — 한 줄이 80자를 넘지 않는 정적 문자열에는 `className="..."` 그대로 사용.
10. Form 스키마는 **Zod로 정의**하고, `useForm`에 `zodResolver`로 연결한다 — 인라인 validation 로직 금지.

---

## 피드백 루프 (모든 코드 생성에 적용)

### Phase 1 — Generator

아키텍처 불변량과 해당 docs 문서를 기준으로 초안을 작성한다.

### Phase 2 — Evaluator `<scratchpad>`

출력 전 아래 항목을 자가 점검하고, 실패 시 Phase 1으로 돌아간다.

- [ ] `'use client'`가 최하위 리프에만 있는가?
- [ ] `useEffect`로 데이터 페칭을 하지 않았는가?
- [ ] TypeScript `any` 타입이 없는가?
- [ ] `Screen -> Component -> Hook` 계층을 준수했는가?
- [ ] TanStack Query 훅이 Query Key Factory 패턴을 따르는가?
- [ ] 80자를 넘는 `className`을 `cn()`으로 분리했는가?
- [ ] Form 검증이 Zod 스키마로 정의되어 있는가?
- [ ] 불필요한 서론/결론 멘트를 제거했는가?

### Phase 3 — Output

평가기를 통과한 결과물만 출력한다.

---

## 상세 문서 인덱스

> `docs/ai/` — AI 최적화 버전 (한국어, 표/코드 블록 중심, 산문 최소화)

| 문서                                                                   | 로드 조건                                                 |
| ---------------------------------------------------------------------- | --------------------------------------------------------- |
| [docs/ai/ARCHITECTURE.md](docs/ai/ARCHITECTURE.md)                     | 시스템 구조, Provider 체인, 모듈 계층, 상태관리 파악 시   |
| [docs/ai/API.md](docs/ai/API.md)                                       | REST API, Axios 클라이언트, TanStack Query 패턴, 토큰 갱신 시 |
| [docs/ai/DEVELOPMENT.md](docs/ai/DEVELOPMENT.md)                       | 개발 환경 설정, 명령어, 기능 개발 패턴, 트러블슈팅 시     |
| [docs/ai/CONVENTIONS.md](docs/ai/CONVENTIONS.md)                       | 코딩 컨벤션, 네이밍, 파일 구조 규칙 확인 시               |
| [docs/ai/TAILWIND_STYLING_GUIDE.md](docs/ai/TAILWIND_STYLING_GUIDE.md) | 스타일링, Tailwind 클래스, 반응형 작업 시                 |
| [docs/ai/ROUTE_ACCESS_POLICY.md](docs/ai/ROUTE_ACCESS_POLICY.md)       | 라우트 접근 권한, 인증 미들웨어, 토큰 검증 시             |
| [docs/ai/BRANCH_RELEASE_POLICY.md](docs/ai/BRANCH_RELEASE_POLICY.md)   | 브랜치 전략, 릴리즈 프로세스 확인 시                      |
| [docs/ai/WORKFLOWS.md](docs/ai/WORKFLOWS.md)                           | CI/CD, ESLint 설정, PR Check 확인 시                      |
| [docs/ai/TECH_DEBT.md](docs/ai/TECH_DEBT.md)                           | 기술 부채 스캔 기준, 정리 프로세스, 등록 방법 확인 시     |
| [docs/ai/CONTEXT.md](docs/ai/CONTEXT.md)                               | AI 문서 인덱스, 원본 매핑 정보 확인 시                    |
