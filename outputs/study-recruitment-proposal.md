# 1D1S 독립 스터디 기능 + 일지 연결 설계 제안서

> 작성일: 2026-07-20 (방향 전환 개정본)
> 범위: 제품 기획/설계 제안 (코드 수정 없음)
> 방법: 1D1S 클라이언트(`1D1S-client`, HEAD `7a48042`)/서버(`1D1S-server-v2`) 현재 소스 재확인 + 시장 리서치
> 근거 원칙: 서비스 파악은 file:line 근거, 시장 조사는 출처 명시, 불확실은 명시 표기

---

## 이번 개정의 방향 전환 (이전 제안 대비)

- **폐기:** "스터디 = 챌린지 특수화(A안)". 사용자는 챌린지를 스터디로 재라벨링하는 걸 원하지 **않는다.**
- **채택:** **독립적이고 가벼운 스터디 엔티티** — 챌린지의 목표(goal)/스트릭/인증(photoRequired) 같은 기계장치 **없이**, **모집 기간 · 정원 · 설명 · 카테고리** 정도의 최소 모집 메타데이터만 가진다. 모집→신청→승인→정원 라이프사이클은 기존 participant 상태머신을 **참고 재사용**.
- **제안서의 중심:** 이 독립 스터디를 기존 **일지(diary) 시스템과 어떻게 연결하느냐.** 여기서 스트릭 카운트 여부가 핵심 제품 결정 포인트다.
- **이전 C(완전 분리) 논거 재검토:** 이전엔 "스터디를 챌린지/일지/스트릭과 끊으면 리텐션 단절"이라 C를 깠다. **이번 의도는 엔티티는 독립이되 활동(로그)은 일지로 연결**한다 — 즉 "엔티티 독립 ≠ 활동 단절". 일지 연결이 리텐션 단절 문제를 해소하므로, 독립 스터디는 정당하다. **관건은 "얼마나 독립적이냐"가 아니라 "일지에 얼마나 매끄럽게 연결되느냐".**

---

## TL;DR

- **스터디 엔티티(신규, 경량):** `title / description / category / 모집기간 / 정원 / 상태 / 호스트 / 공개범위`만. 목표·스트릭·인증 없음. 멤버십은 participant 패턴 재사용(신청→승인→정원→탈퇴).
- **결정적 코드 사실 2가지 (일지 연결의 토대):**
  1. **DB에서 `diary.challenge_id`는 이미 nullable** (`V1__init.sql:78` — `challenge_id bigint DEFAULT NULL`). 일지는 챌린지 없이도 물리적으로 존재 가능. NOT-NULL은 **서비스 로직에만** 존재(`DiaryService.java:88-91`).
  2. **스트릭은 회원 전체 일지 기준**(`MemberService.java:174,189` → `findDiariesByMember_IdAndIsDeletedFalse`, 챌린지 무관 합산). → **스터디 일지를 `member_id`가 있는 Diary 행으로 쓰면 스트릭에 자동 카운트된다.**
- **추천 연결 방식:** **옵션 1 — 다형적 일지 소속**(일지가 챌린지 XOR 스터디에 속함, member는 항상 소유자). 마이그레이션은 **nullable 컬럼 1개 추가**로 끝(기존 일지 무영향), null-가드 필요 지점은 **단 3곳**(`AdminDiaryService.java:180`, `DiaryService.java:288,713`).
- **스트릭 결정 포인트:** 스트릭이 member-scoped라 스터디 일지는 **기본적으로 카운트됨**. 이건 우연이 아니라 **명시적 제품 결정**으로 다뤄야 한다(카운트할지 / 필터로 뺄지).

---

## 1. 서비스 파악 (일지 연결 관점, 소스 근거)

### 1.1 핵심 루프 (현재)

```
Member ──owns──> Diary ──belongs to──> Challenge(필수, 서비스 로직상)
   ^                │
   └── Streak ◀── Diary.completedDate (member 전체 일지에서 계산, 챌린지 무관)
```

- 일지는 회원이 소유(`Diary.member`, member_id FK)하면서 동시에 챌린지에 종속(`Diary.challenge`, challenge_id FK).
- 스트릭은 회원의 모든 일지 작성일에서 계산.

### 1.2 일지 종속의 정확한 실체 (연결 설계의 관건)

| 사실 | 근거 | 함의 |
|---|---|---|
| 클라 일지 생성 요청에 `challengeId` 필수 | `diary/board/type/diary.ts:83-96` (`CreateDiaryRequest.challengeId: number`) | 클라에서 스터디 일지를 쓰려면 이 필수 필드를 우회/다형화해야 |
| `Diary` 엔티티는 `member`(member_id) + `challenge`(challenge_id) FK 둘 다 보유 | 서버 `diary/entity/Diary.java:85-91` | member는 이미 1급 소유자. challenge는 옵션화 여지 |
| `challenge_id` JoinColumn에 `nullable=false` **없음** | `Diary.java:89-91` (`@JoinColumn(name="challenge_id")` 단독) | JPA 기준 nullable=true |
| **DB 컬럼 `challenge_id bigint DEFAULT NULL`** | `V1__init.sql:68-80` | **스키마상 이미 nullable — 제약 완화 마이그레이션 불필요** |
| 일지 생성 로직이 challenge/participant/goal을 **강제 조회** | `DiaryService.java:75-140` (challenge 조회→participant 조회→challenge_goal로 diary_goal 생성) | 스터디 일지는 이 3단 기계장치를 **건너뛰는 분기**가 필요 |
| 스트릭 계산 입력이 **member 전체 일지** | `MemberService.java:174,189` (`findDiariesByMember_IdAndIsDeletedFalse`), `calculateStreaks:254-297` | **스터디 일지가 member_id를 가지면 스트릭에 자동 포함** |
| 챌린지 통계/일지목록은 `challenge_id`로 필터 | `V34__add_challenge_statistics_indexes.sql` (`diary(challenge_id, is_deleted, completed_date)`) | challenge_id=null 스터디 일지는 챌린지 통계/목록에 **자연 배제**(누수 없음) |
| `diary.getChallenge()` 직접 접근은 **3곳뿐** | `AdminDiaryService.java:180`, `DiaryService.java:288,713` (모두 `toChallengeSummary(diary.getChallenge())`) | null-safety 감사 범위가 매우 좁음 |

### 1.3 스터디 모집에 재사용 가능한 기존 인프라

| 필요 | 재사용 | 근거 |
|---|---|---|
| 모집→신청→승인→정원→탈퇴 | 참여자 상태머신(`PENDING→ACCEPTED/REJECTED`, HOST) | `challenge.ts:24-30`, `challengeDetailApi.ts:60-101`, 서버 `ChallengeService.applyParticipant` |
| 카테고리 | 챌린지 카테고리 enum(ALL/DEV/EXERCISE/BOOK/…) | `challenge/board/type/challenge.ts:5-15` |
| 신청/승인 알림 | 알림 CHALLENGE_APPROVED/REJECTED 패턴 | `notification/type/notification.ts:3-11` |
| 일지 에디터/이미지/좋아요/댓글 | 일지 작성 UI 전체 | `diary/write/**`, `diaryCommentApi.ts` |
| 공개 열람(모집 랜딩) | 게스트 상세 개방 패턴 | commit `fab9ea8` |
| 운영/모더레이션 | admin 백오피스 | 서버 `admin/**`, `AdminDiaryController` |

> `study` 도메인은 서버·클라 어디에도 아직 없음(신규). 친구 API 스키마는 프론트 추정치(`friend/type/friend.ts:1-7`) — 스터디 멤버십을 친구 패턴으로 참고 시 서버 재확인.

---

## 2. 스터디 엔티티 정의 (경량, 독립)

**설계 원칙:** 스터디는 "함께할 사람을 모으는 가벼운 그릇"이다. 목표 달성·인증·개별 스트릭 같은 챌린지의 기계장치를 **넣지 않는다**. 활동의 증거는 일지로 위임한다.

**최소 필드**

| 필드 | 설명 |
|---|---|
| `id`, `host(member)` | 식별자, 개설자 |
| `title`, `description` | 제목, 소개 |
| `category` | 기존 `ChallengeCategory` enum 재사용 |
| `recruitStartDate` / `recruitEndDate` | 모집 기간 |
| `capacity` | 정원(모집 인원) |
| `status` | `RECRUITING`(모집중) / `CLOSED`(모집마감) / `ENDED`(종료) |
| `visibility` | `PUBLIC` / `PRIVATE`(선택) |
| `thumbnail` | 선택 |

**멤버십(별도 `study_member`):** `status`(PENDING/ACCEPTED/REJECTED/HOST), 신청→승인→정원제한→탈퇴 — participant 패턴 참고 복제.

**명시적으로 넣지 않는 것:** ChallengeGoal, per-study streak, photoRequired 인증, goalType(FIXED/FLEXIBLE), 종료 후 유예 등 챌린지 고유 기계장치.

---

## 3. 시장/레퍼런스 리서치 (유지, 연결 관점으로 재해석)

| 서비스 | 스터디의 "활동 기록"을 어떻게 다루나 | 시사점 |
|---|---|---|
| 캠퍼스픽 / 인프런 | 모집만, 활동은 외부(디스코드/노션) | 대부분 **모집 후 이탈** — 1D1S는 일지로 활동을 앱 안에 붙잡을 수 있음(차별) |
| 열품타 | 그룹 + 공부시간/랭킹을 앱 내 기록 | **활동을 앱 내 기록으로 붙잡아 리텐션** — 1D1S의 "일지" 등가물 |
| Study Together | 스터디룸 + 리더보드/롤 게이미피케이션 | 함께 기록이 리텐션 동력 |
| 챌린저스 | 인증샷 기반 기록 | 인증 UI는 일지 재사용으로 흡수 가능 |
| 트레바리 | 오프라인 모임 + 유료 멤버십 | 경량 스터디에 향후 유료화 옵션 참고 |
| Focusmate | 1:1 실시간 세션 | 1D1S에 없는 실시간 축(장기 확장 카드) |

**핵심:** 모집만 하는 서비스는 활동이 외부로 샌다. 1D1S의 차별점은 **"모집한 스터디의 활동을 일지로 앱 안에 남기고, 그게 스트릭으로 이어진다"**는 것. 이것이 독립 스터디를 굳이 1D1S 안에 두는 이유다.

> 서비스 팩트/통계는 2차 인용(부록), 방향성 참고용.

---

## 4. 일지 연결 설계 — 옵션 비교 (제안서의 중심)

세 옵션 모두 "스터디 참여자가 스터디 안에서 일지를 남긴다"를 목표로 하되, 일지 데이터의 소속을 어떻게 처리하느냐가 다르다.

공통 전제(재확인): **DB `challenge_id`는 이미 nullable**(`V1__init.sql:78`), **`member_id`도 이미 존재**, **스트릭은 member-scoped**(`MemberService.java:189`).

---

### 옵션 1 — 다형적 일지 소속 (일지 = 챌린지 XOR 스터디, member는 항상 소유자) ★추천

**개념:** 일지에 `study_id`(nullable)를 추가. 일지는 `challenge_id`(nullable, 기존) **또는** `study_id` 중 하나에 속한다. member는 언제나 소유자.

**데이터 모델 변경**
- `ALTER TABLE diary ADD COLUMN study_id bigint DEFAULT NULL;` + `@ManyToOne study`.
- `challenge_id`는 이미 nullable → **추가 스키마 완화 불필요.**

**서버 API 영향**
- `DiaryService.createDiary`에 **스터디 분기**: challenge/participant/goal 조회를 건너뛰고 스터디 멤버십만 검증. `challengeId` XOR `studyId`를 받는 생성 경로(신규 파라미터 또는 별도 엔드포인트).
- **null-가드 3곳**: `AdminDiaryService.java:180`, `DiaryService.java:288`, `:713` (`toChallengeSummary(diary.getChallenge())`) — 스터디 일지면 challenge summary 대신 study summary/null 반환.

**마이그레이션 리스크: 낮음**
- 가법적 nullable 컬럼 1개. 기존 일지 행은 `study_id=null`로 무영향. challenge_id 제약 변경 없음.

**스트릭 영향 (제품 결정 포인트)**
- 스트릭 쿼리가 member-scoped라 **스터디 일지가 자동 카운트됨**. → §5의 결정 필요. 카운트 원치 않으면 스트릭 쿼리에 `challenge_id IS NOT NULL` 등 **명시적 필터** 추가.

**개발 공수: 중하(★★☆)** — 컬럼/엔티티 + 생성 분기 + null-가드 3곳 + 클라 생성요청 다형화.

**UX 흐름**
- 스터디 상세 → "오늘 기록 남기기" → 기존 일지 에디터(재사용) → 저장 시 `studyId`로 귀속 → 스터디 로그 스트림 + (정책에 따라) 스트릭 반영.

**기존 챌린지 일지와 충돌**
- 거의 없음. 챌린지 통계/목록은 `challenge_id` 필터라 스터디 일지 자연 배제. 리스크는 `getChallenge()` 3곳뿐 → 가드로 해소.

---

### 옵션 2 — 스터디 전용 로그 스트림 (별도 테이블, 에디터 UI만 재사용)

**개념:** `diary` 테이블은 손대지 않고, `study_log`(또는 StudyDiary) 신규 테이블에 스터디 활동을 저장. 클라의 Tiptap 에디터/이미지 UI는 재사용하되 서버 저장 대상만 분리.

**데이터 모델 변경**
- 신규 `study_log` 테이블(+ 이미지/좋아요/댓글을 쓰려면 그 부속 테이블도 별도).

**서버 API 영향**
- 신규 StudyLog 도메인(CRUD) — DiaryService와 독립. diary 관련 코드 무변경.

**마이그레이션 리스크: 최저(일지 무관)** — 신규 테이블뿐, 기존 diary 완전 무영향.

**스트릭 영향 (제품 결정 포인트)**
- 스트릭 쿼리는 `diary` 테이블만 읽음 → **스터디 로그는 자동 카운트 안 됨.** 카운트하려면 `MemberService.calculateStreaks` 입력에 study_log 날짜를 **union하는 추가 작업** 필요(+ 결정).

**개발 공수: 중상(★★★)** — 로그 도메인 신설 + **일지 생태계(이미지/좋아요/댓글/신고/피드/모더레이션) 중복 구현 또는 포기**. 여기서 비용이 커진다(중복 부채).

**UX 흐름**
- 스터디 상세 → 로그 작성(에디터 재사용) → study_log 저장. 단, 좋아요/댓글/피드 노출을 원하면 그 기능을 로그용으로 또 만들어야.

**기존 챌린지 일지와 충돌**
- 없음(완전 분리). 대신 **두 개의 평행 로그 시스템**이 장기 부채(피드/알림/모더레이션 이원화).

---

### 옵션 3 — 일지를 member 소속으로 해방, 챌린지/스터디는 선택 태그

**개념:** "모든 일지는 챌린지를 가진다"는 서비스 불변식 자체를 완화. 일지는 member 소유가 본질이고, 챌린지/스터디는 **선택적 context 태그**(둘 다 없는 순수 개인 일지도 허용).

**데이터 모델 변경**
- 옵션 1과 동일한 스키마 이동(`study_id` nullable 추가). 차이는 **서비스 계층에서 challenge 필수 로직을 전면 조건부화**.

**서버 API 영향**
- `DiaryService`의 challenge/participant/goal 로직을 "challenge가 있을 때만" 수행하도록 광범위 리팩터. 가장 미래지향적이지만 **불변식 변경 폭이 큼**.

**마이그레이션 리스크: DB는 낮음(옵션 1과 동일), 코드는 높음** — "일지엔 챌린지가 있다"를 가정하는 모든 코드 감사 필요(3곳보다 넓어질 수 있음).

**스트릭 영향** — member-scoped라 자연 정합(개인/스터디/챌린지 일지 모두 카운트). 결정 포인트 동일.

**개발 공수: 상(★★★★)** — 불변식 완화 + 광범위 회귀 검증.

**UX 흐름** — 개인 일지/스터디 일지/챌린지 일지가 하나의 "내 기록"으로 통합(장기적으로 가장 깔끔).

**충돌** — 불변식 변경으로 챌린지 일지 흐름 회귀 위험 가장 큼.

---

### 4.x 옵션 요약 비교

| 기준 | 옵션 1 (다형 소속) | 옵션 2 (별도 스트림) | 옵션 3 (member 해방) |
|---|---|---|---|
| 데이터 모델 | study_id 컬럼 추가 | study_log 테이블 신설 | study_id 추가(동일) |
| 마이그레이션 리스크 | 낮음(가법 컬럼) | 최저(diary 무관) | DB 낮음/코드 높음 |
| 일지 생태계 재사용 | **전부 재사용** | 중복 or 포기 | 전부 재사용 |
| 스트릭 자동 카운트 | **예**(필터로 제어) | 아니오(union 필요) | 예 |
| null-safety 감사 | **3곳** | 없음 | 넓음(불변식) |
| 개발 공수 | 중하 | 중상(중복부채) | 상 |
| 미래 확장성 | 좋음 | 이원화 부채 | **최상** |

---

## 5. 스트릭 결정 포인트 (명시적 제품 결정 필요)

스트릭이 member-scoped(`MemberService.java:189`)이므로, 옵션 1/3에서 **스터디 일지는 코드 추가 없이 스트릭에 카운트된다.** 이건 우연에 맡길 게 아니라 결정해야 한다.

- **카운트한다(권장 기본):** "오늘도 무언가 기록했다"를 통합 → 핵심 리텐션 루프 강화, 스터디 참여 보상감↑. 단, 스터디 일지는 목표/인증이 없어 **증명 강도가 약함** → 어뷰징(빈 일지로 스트릭 유지) 여지.
- **카운트 안 한다:** 스트릭의 의미("챌린지 목표 달성")를 순수 유지. 구현은 스트릭 쿼리에 `challenge_id IS NOT NULL` 필터 **명시 추가**(옵션 1/3), 또는 옵션 2에서는 애초에 분리.
- **절충(권장):** 기본 카운트하되, 어뷰징 방지 장치(예: 최소 글자수/이미지, 하루 1회) 또는 향후 `counts_toward_streak` 플래그로 통제. **어느 쪽이든 "필터/플래그로 명시"** — 창발적 동작으로 남기지 말 것.

> 불확실: 어뷰징 실측 데이터가 없으므로 초기엔 "카운트 + 최소 품질 가드"로 출시 후 코호트로 재검토 권장.

---

## 6. 추천안 및 근거

### 추천: **옵션 1 (다형적 일지 소속)** — 장기적으로 옵션 3로 수렴

**근거**
1. **일지 생태계(에디터·이미지·좋아요·댓글·신고·피드·모더레이션)를 통째 재사용** — 옵션 2의 중복 부채를 피한다(가장 lazy한 정답).
2. **마이그레이션 near-zero** — `challenge_id`는 이미 nullable(`V1__init.sql:78`), `member_id` 이미 존재, 추가는 nullable 컬럼 1개. 기존 일지 무영향.
3. **회귀 표면이 작다** — `getChallenge()` 직접 접근 **3곳**만 null-가드(`AdminDiaryService.java:180`, `DiaryService.java:288,713`). 챌린지 통계/목록은 `challenge_id` 필터라 스터디 일지 자연 배제.
4. **스트릭 결정을 깔끔히 통제** — member-scoped라 기본 카운트, 원치 않으면 필터 한 줄.
5. **옵션 3(member 해방)는 북극성**이지만 불변식 변경 폭이 커 초기 리스크 과다 → 옵션 1로 출발해 나중에 자연 수렴(스키마가 이미 동일).

**옵션 2 비채택 이유:** diary 생태계를 두 벌 유지하는 장기 부채(피드/좋아요/댓글/알림/모더레이션 이원화)가 경량 스터디의 취지에 반한다.

### 확인 필요(불확실)
- 클라 `CreateDiaryRequest.challengeId`는 현재 필수(`diary.ts:84`) — 다형화 시 `challengeId?`/`studyId?` XOR 타입·검증 재설계 필요.
- 스터디 멤버십을 어느 패턴(participant 복제 vs friend 참고)으로 구현할지, 친구 스키마 추정치(`friend/type/friend.ts:1-7`) 서버 재확인.
- OFFICIAL "예약" 상태전이·admin 권한 경계는 컨트롤러 시그니처까지만 확인 — 스터디에 admin/공식 개념 얹기 전 서비스 로직 재확인.

---

## 7. 단계적 롤아웃 (MVP → 확장)

### Phase 0 — 스펙 확정
- 스터디 엔티티 필드/멤버십 상태머신 확정
- **스트릭 정책 결정**(§5): 카운트 여부 + 품질 가드
- 일지 생성 요청 다형화 타입 설계

### Phase 1 — MVP: 최소 스터디 CRUD + 모집 (일지 연결 전)
- `Study` 도메인 + `study_member`(participant 패턴 참고): 개설/수정/목록/상세, 신청→승인→정원→탈퇴
- 카테고리/모집기간/정원/설명, 상태(RECRUITING/CLOSED/ENDED)
- 모집 목록/상세 화면(게스트 공개 열람 패턴 재사용), 신청/승인 알림(기존 패턴)
- **성공 지표:** 스터디 개설 수, 지원→승인 전환율, 모집 마감률

### Phase 2 — 일지 연결 (옵션 1 구현)
- `diary.study_id`(nullable) 추가, `@ManyToOne study`
- `DiaryService.createDiary` 스터디 분기(participant/goal 스킵, 스터디 멤버십 검증)
- **null-가드 3곳** 적용(`AdminDiaryService:180`, `DiaryService:288,713`)
- 클라: 스터디 상세에 "기록 남기기" → 일지 에디터 재사용 → `studyId` 귀속, 스터디 로그 스트림
- **스트릭 정책 적용**(카운트/필터)
- **성공 지표:** 스터디원 7일/28일 일지 작성 리텐션, 스터디 일지 비율, 스트릭 정책별 A/B

### Phase 3 — 스터디 경험 강화
- 스터디 게시판/공지, 마이페이지 "참여 스터디", 멤버 프로필 연동
- 좋아요/댓글(일지 재사용), 스터디 리더보드(선택), 찌르기 등 참여 독려
- 공식/큐레이션 스터디(admin) + 배너 프로모션

### Phase 4 — 확장/수익화(선택)
- 프리미엄/공식 스터디, (실험) 실시간 세션 매칭(Focusmate형)
- 옵션 3(member 해방)로 수렴 검토 — 개인 일지/스터디 일지/챌린지 일지 통합 "내 기록"

---

## 부록: 출처

### 코드 근거 (현재 소스)
- 클라이언트(HEAD `7a48042`)
  - 일지 생성 요청 챌린지 필수: `src/app.feature/diary/board/type/diary.ts:83-96`
  - 참여자 상태머신/카테고리: `src/app.feature/challenge/board/type/challenge.ts:5-15, 24-30`
- 서버(`1D1S-server-v2`)
  - Diary 엔티티(member+challenge FK, challenge nullable): `domain/diary/entity/Diary.java:85-91`
  - DB diary DDL(challenge_id/member_id DEFAULT NULL): `db/migration/V1__init.sql:68-80`
  - 일지 생성 강제 조회 로직: `domain/diary/service/DiaryService.java:75-140`
  - `getChallenge()` 접근 3곳: `domain/diary/service/AdminDiaryService.java:180`, `DiaryService.java:288,713`
  - 스트릭 member-scoped: `domain/member/service/MemberService.java:174,189`, `calculateStreaks:254-297`
  - 챌린지 통계 인덱스(challenge_id 필터): `db/migration/V34__add_challenge_statistics_indexes.sql`

### 웹 리서치 출처
- 캠퍼스픽 — https://www.campuspick.com/study
- 스터디파이 — https://studypie.co/
- 인프런 스터디 — https://www.inflearn.com/community/studies
- 열품타 — https://namu.wiki/w/%EC%97%B4%EC%A0%95%20%ED%92%88%EC%9D%80%20%ED%83%80%EC%9D%B4%EB%A8%B8
- 트레바리 — https://m.trevari.co.kr/
- 챌린저스 — https://namu.wiki/w/%EC%B1%8C%EB%A6%B0%EC%A0%80%EC%8A%A4
- Focusmate — https://www.focusmate.com/
- Study Together — https://www.studytogether.com/discord

> 시장 통계·수익화 수치는 2차 자료 인용으로 방향성 참고용이며, 자체 데이터 재검증 권장.
