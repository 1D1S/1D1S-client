# 1D1S 최종 페이지/화면 구조 (IA)

> 작성일: 2026-07-20
> 범위: 정보구조(IA)/화면 설계 제안 (코드 수정 없음)
> 기반: 포지셔닝 B("함께 기록하며 꾸준함") · 온보딩 사다리(스터디→채팅→일지→스트릭→챌린지) · 경량 독립 스터디+일지 연결 · 콜드스타트 전술 (동일 세션 산출물)
> 근거 원칙: 현행 구조는 file:line, 신규는 설계 제안, 불확실은 명시 표기

---

## 0. 요약

- **최종 네비:** 5탭 유지하되 **중앙 탭을 "챌린지"에서 "스터디"로 교체**(챌린지는 사다리 상단 심화로 강등, 탐색/홈에서 진입). → `홈 · 탐색 · 스터디(중앙) · 일지 · 마이`
- **채팅:** 독립 탭 아님. **스터디에 종속된 기능**(`/study/[id]/chat`) — 사다리 [2]는 스터디의 하위 경험.
- **네이티브 현실:** BottomNav는 Flutter IndexedStack(멀티 WebView)라 **탭 교체/추가는 네이티브 작업 필요**(`NativeBridge.tsx:31-40`). 서브 화면은 웹 라우트만으로 OK. → MVP는 스터디를 **웹 라우트+탐색 노출**로 먼저 내고, 검증 후 **네이티브 중앙 탭 승격**.

---

## 1. 현행 구조 (baseline, 근거 file:line)

### 1.1 하단 네비 5탭

`src/app.component/layout/AppBottomNav.tsx:26-37`

| 탭 | 경로 | 아이콘 | 비고 |
|---|---|---|---|
| 홈 | `/` | Home | |
| 탐색 | `/explore` | Compass | |
| **챌린지** | `/challenge` | ChallengeTrophyIcon | **중앙(트로피)** |
| 일지 | `/diary` | BookOpen | |
| 마이 | `/mypage` | User | 게스트는 "로그인"으로 표기(`AppBottomNav.tsx:50-53`) |

- 데스크톱은 동일 5탭을 상단 네비로(`AppTopNav.tsx:26-35`).
- **탭 노출 규칙:** 정확히 최상위 탭 경로에서만 BottomNav 노출, 하위 경로는 서브 화면(뒤로가기)으로 간주 — `AppLayoutShell.tsx:62-70`(`isBottomNavVisible`).
- **활성 탭 판정:** 경로 prefix로 매핑(`/explore`→explore, `/challenge`→challenge, `/diary`→diary, `/mypage`→mypage, else home) — `AppLayoutShell.tsx:71-88`(`resolveActiveNavId`).
- **뒤로가기 버튼:** 챌린지/일지 서브 경로 등에서 노출 — `AppLayoutShell.tsx:90+`(`needsBackButton`).

### 1.2 현행 라우트 트리 (`find src/app -name page.tsx`)

```
/                              홈
/(auth)/login · /signup        인증
/(auth)/login/oauth2/code/[provider]  OAuth 콜백
/explore                       탐색(공식 챌린지 + 랜덤 챌린지 + 추천 일지)
/challenge/(board)             챌린지 목록
/challenge/create              챌린지 개설
/challenge/[id]                챌린지 상세
/challenge/[id]/edit           챌린지 수정
/challenge/[id]/diary          챌린지별 일지 목록
/challenge/[id]/participants   참여자/승인 관리
/diary/(board)                 일지 목록
/diary/create                  일지 작성
/diary/[id]                    일지 상세
/member/[memberId]             회원 프로필
/member/[memberId]/challenge · /diary  회원 챌린지·일지
/mypage                        마이페이지
/mypage/challenge · /diary · /statistics  내 챌린지·일지·통계
/mypage/friend (+ received, sent)  친구/요청
/mypage/settings (+ profile, notifications)  설정
/notification                  알림
/notice · /notice/[id]         공지
/onboarding                    온보딩
/guide · /guide/official       가이드
/inquiry · /install · /privacy · /terms  기타
```

### 1.3 각 화면 역할 (현행)

| 화면 | 역할 | 근거 |
|---|---|---|
| 홈 | 오늘의 기록 현황·스트릭·추천, 게스트는 CTA | `home/screen/HomeScreen.tsx`, 게스트 CTA `commit 0618ef4` |
| 탐색 | 공식 챌린지 + 랜덤 챌린지 + 추천 일지, 비로그인 열람 | `explore/screen/ExploreScreen.tsx:20-133`, `useExploreOfficialChallenges.ts` |
| 챌린지 | 목록/개설/상세/일지/참여자, 그룹 커밋 중심 | `challenge/**` |
| 일지 | 목록/작성/상세(챌린지 종속) | `diary/**` |
| 마이 | 프로필·스트릭·통계·친구·설정 | `member/**` |

---

## 2. 최종 네비게이션 구조 제안

### 2.1 원칙 — 포지셔닝 B의 "입구를 저커밋 스터디로"를 네비에 반영

사다리: `[1]스터디 → [2]채팅 → [3]일지 → [4]스트릭 → [+]챌린지`. 현행은 **고커밋 챌린지가 중앙 탭**이라 사다리와 역방향. → **중앙 탭을 스터디로 교체**하고 챌린지를 심화 경로로 재배치.

### 2.2 추천안(목표): 5탭 재편 — 중앙 "스터디"

| 탭 | 경로 | 변경 | 근거 |
|---|---|---|---|
| 홈 | `/` | 스터디/오늘 기록 우선, 게스트 CTA | 사다리 입구 강조 |
| 탐색 | `/explore` | **스터디 모집 섹션을 최상단**에 + 공식 챌린지/추천 일지 | 발견의 첫 물음이 "함께할 스터디" |
| **스터디** | `/study` | **신규 중앙 탭**(챌린지 탭 대체) | 사다리 [1] 입구 |
| 일지 | `/diary` | 스터디 일지 포함(다형) | 사다리 [3] |
| 마이 | `/mypage` | "참여 스터디" 섹션 + 채팅 진입점 | |

- **챌린지는 탭에서 내려** 탐색 섹션 + 스터디에서 "챌린지로 승급" 진입점 + 홈 바로가기로 접근. 기존 `/challenge/**` 라우트는 **유지**(진입 경로만 재배치).
- **리스크:** 기존 챌린지 헤비유저의 접근성 하락 → 탐색 상단 고정 섹션 + 홈 바로가기 + 마이 "내 챌린지"로 보완. (실측 사용률 데이터 없음 — 재배치 영향은 출시 후 모니터링 필요로 표기.)

### 2.3 대안(보수적, MVP 낙폭 최소): 5탭 유지 + 스터디를 탐색 흡수

- 홈/탐색/챌린지/일지/마이 그대로 두고, **스터디를 탐색 내 탭/섹션**으로 흡수. 채팅은 스터디 상세 진입점만.
- 장점: 네이티브 변경 0(웹 라우트만). 단점: 포지셔닝 B의 "입구=스터디"가 네비에서 약하게 표현됨.
- **권장 시퀀스:** 대안(2.3)으로 MVP 출시 → 지표 확인 후 추천안(2.2)의 네이티브 탭 승격. (네이티브 탭 교체 비용 회피 + 검증 우선.)

### 2.4 채팅 배치

- **독립 탭 불필요.** 채팅은 스터디원 대화라 스터디에 종속: `/study/[id]/chat`. 마이/알림에서 "내 채팅" 진입점(후속: 채팅 인박스 `/chat`).
- ⚠️ **실시간 채팅 인프라는 현 코드에서 미확인**(WebSocket/구독 등). 신규 인프라 필요 — 무거운 항목, 후속 단계로 표기.

---

## 3. 페이지별 명세

### 3.1 신규 페이지

| 페이지 | 목적 | 핵심 요소 | 주요 액션 |
|---|---|---|---|
| **`/study` 스터디 목록/모집** | 저커밋 진입(발견) | 모집중 스터디 카드(제목·카테고리·**모집기간·정원/현재원**), 필터(카테고리/상태), 공식 스터디 섹션, 개설 CTA | 필터·검색, 카드→상세, 개설 |
| **`/study/create` 개설** | 경량 스터디 생성 | 최소 폼: 제목·설명·카테고리·모집기간·정원·공개범위 (Zod) | 저장 → 상세 |
| **`/study/[id]` 상세** | 모집 랜딩 + 활동 허브 | 모집정보, 멤버 목록/현재원, **로그 스트림(참여자 일지)**, 채팅 진입, 참여/신청 CTA | 신청, (호스트)관리, 기록 남기기, 채팅 |
| **`/study/[id]/edit` 수정** | 호스트 편집 | 개설 폼과 동일 | 저장 |
| **`/study/[id]/members` 멤버/신청 관리** | 정원·승인 운영 | 신청 대기/멤버 목록 | 승인/거절/내보내기 (participant 패턴 재사용) |
| **`/study/[id]/log/create` 스터디 일지 작성** | 활동 기록 | **일지 에디터 재사용**(Tiptap·이미지·기분), `studyId` 귀속 | 저장 → 스트림 + (정책)스트릭 |
| **`/study/[id]/chat` 그룹 채팅** (후속) | 사다리 [2] | 메시지 목록·입력 | 전송 (⚠️실시간 인프라 신규) |

- **스터디 일지 상세**는 신규 페이지 없이 **`/diary/[id]` 재사용**(다형 일지, `getChallenge()` null-safe — 별도 산출물 옵션1). 근거: `DiaryService.java:288,713`·`AdminDiaryService.java:180` 3곳 가드.

### 3.2 기존 페이지 변경분

| 페이지 | 변경 | 근거 |
|---|---|---|
| 홈 `/` | 로그인: "내 스터디/오늘 기록" 우선 + 스터디 추천. 게스트: CTA 유지 | 게스트 CTA `commit 0618ef4`(`HomeScreen.tsx`) |
| 탐색 `/explore` | **스터디 모집 섹션 최상단** 추가(공식 챌린지/추천 일지 위) | `ExploreScreen.tsx:20-133` 확장 |
| 일지 `/diary` | 스터디 일지 혼재 노출 + 소속 필터(챌린지/스터디/개인) | 다형 일지 |
| 일지 상세 `/diary/[id]` | 스터디 일지도 렌더(challenge null 가드) | 옵션1 연결 |
| 마이 `/mypage` | "참여 스터디" 섹션 + 채팅 진입점(후속) | |
| (네비) 챌린지 탭 | 중앙 탭 → 탐색/홈 진입점으로 강등(라우트 유지) | 2.2 |

---

## 4. 게스트 vs 로그인 상태별 차이 (콜드스타트 반영)

| 화면 | 게스트 | 로그인 |
|---|---|---|
| 홈 `/` | **게스트 CTA 즉시 표시**(로그인 스켈레톤 아님) | 개인화(오늘 기록·스트릭·내 스터디) |
| 탐색 `/explore` | 열람 가능, 카드 클릭 시 로그인 유도 | 전체 |
| 스터디 목록 `/study` | **열람 가능**(모집중·공식 스터디 노출) | 열람+신청 |
| 스터디 상세 `/study/[id]` | **열람 가능**(멤버 수·활동 로그로 "살아있는" 느낌) | 신청/기록/채팅 |
| 참여/일지작성/채팅 | 로그인 유도 | 가능 |

- 근거·패턴: 게스트 상세 개방(`commit fab9ea8`, 개인화 null-safe·PRIVATE 403·미예약 OFFICIAL 404), 탐색 게스트 열람(`ExploreScreen.tsx:25,124` `isLoggedIn`로 클릭 시 유도), 게스트 홈 CTA(`0618ef4`).
- **"살아있는 느낌" 공급:** OFFICIAL 스터디/챌린지 프리시드(참여자 0명도 노출 — `useExploreOfficialChallenges.ts` 주석) + 멤버수/최근 로그 노출.

---

## 5. 온보딩 사다리 = 신규 유저 첫 세션 화면 흐름

```
(A) 게스트 랜딩
    홈 게스트 CTA(0618ef4)  또는  공유링크→ /study/[id] 게스트 열람(fab9ea8)
        │  "여긴 사람이 있다" 체감
        ▼
(B) 가입 → /onboarding
        ▼
[1] 가볍게 진입   /explore·/study 에서 저커밋 스터디 신청 → 승인
        ▼
[2] 사람과 엮임   /study/[id]/chat 입장 (후속 단계)
        ▼
[3] 기록 축적     /study/[id]/log/create 첫 일지 (에디터 재사용)
        ▼
[4] 습관화        일지 작성일 → 스트릭 1 (member-scoped 자동 카운트)
        ▼
[+] 강한 커밋     스터디 상세/홈에서 "챌린지로 승급" 제안(원하는 사람만)
```

- **첫날 가치(TTV) 핵심:** [1]→[3]까지 마찰 최소화(신청→승인→첫 일지). [4] 스트릭 1은 즉각 보상.
- 근거: 스트릭 member-scoped라 스터디 일지가 자동 카운트(`MemberService.java:189`) → "가입 당일 스트릭 1" 가능.

---

## 6. 최종 라우트 맵 (텍스트 트리)

`★=신규  ◆=변경  (기존 무표시)`

```
/                                    ◆ 홈(스터디 우선/게스트 CTA)
/(auth)/login · /signup
/(auth)/login/oauth2/code/[provider]

/explore                             ◆ 탐색(스터디 모집 섹션 최상단)

/study                               ★ 스터디 목록/모집  [중앙 탭(목표) / MVP는 탐색 흡수]
/study/create                        ★ 스터디 개설
/study/[id]                          ★ 스터디 상세(모집+멤버+로그 스트림+채팅 진입)
/study/[id]/edit                     ★ 스터디 수정
/study/[id]/members                  ★ 멤버/신청 관리(승인·거절)
/study/[id]/log/create               ★ 스터디 일지 작성(에디터 재사용, studyId 귀속)
/study/[id]/chat                     ★ 그룹 채팅(후속, 실시간 인프라 필요)
/chat                                ★ 채팅 인박스(후속, 선택)

/challenge/(board)                   챌린지 목록 (탭에서 강등, 라우트 유지)
/challenge/create · /[id] · /[id]/edit · /[id]/diary · /[id]/participants

/diary/(board)                       ◆ 일지 목록(스터디 일지 혼재 + 소속 필터)
/diary/create
/diary/[id]                          ◆ 일지 상세(스터디 일지 다형 렌더)

/member/[memberId] (+ /challenge, /diary)   ◆ 프로필에 "참여 스터디"(후속)
/mypage                              ◆ 마이("참여 스터디" 섹션 + 채팅 진입점)
/mypage/challenge · /diary · /statistics
/mypage/friend (+ received, sent)
/mypage/settings (+ profile, notifications)

/notification · /notice · /notice/[id]
/onboarding · /guide · /guide/official
/inquiry · /install · /privacy · /terms
```

---

## 7. 하이브리드 앱(네이티브 chrome) 맞물림 — 한 줄씩

- 네이티브 BottomNav는 Flutter **IndexedStack(멀티 WebView)**, cross-tab 이동은 `native:navigate`→`router.push`로 흡수 — `NativeBridge.tsx:31-40`. → **최상위 탭 교체/추가(스터디를 중앙 탭으로)는 네이티브 IndexedStack 인덱스 변경 필요**(웹만으로 불가, Flutter 레포는 이 저장소 밖 — 작업량 추정·표기).
- 스터디 **서브 화면**(`/study/[id]`, `/create`, `/members`, `/log/create`)은 기존 탭 WebView 내 **웹 라우트** → 네이티브 뒤로가기 자동(`AppLayoutShell.tsx:90+` `needsBackButton` 패턴 확장), 네이티브 변경 없음.
- BottomNav 노출은 **최상위 탭 경로에서만**(`isBottomNavVisible`/`BOTTOM_NAV_VISIBLE_ROUTES` — `AppLayoutShell.tsx:62-70`) → `/study`를 탭으로 승격 시 이 목록에 추가, 서브 경로는 자동 숨김.
- 활성 탭 판정은 prefix 매핑(`resolveActiveNavId` `AppLayoutShell.tsx:71-88`) → `/study` prefix 분기 1줄 추가.
- **스터디 일지 작성**은 `/diary/create` 에디터/네이티브 위임(날짜피커 `e8c264d` 등) 그대로 재사용 → 네이티브 추가 작업 최소.
- **채팅방**은 실시간 입력/키보드 → 네이티브 키보드·세이프에어리어·상단 오프셋 정합 필요(하이브리드 쉘 오프셋 이슈 이력 다수 — 커밋 `62ac5b0`, `ac5bc39` 등). 무거운 항목으로 후속.

---

## 8. 우선순위 (MVP vs 후속)

### MVP (네이티브 탭 변경 없이 웹 라우트로 착수 가능)

- ★ `/study` (목록/모집) — **탐색 흡수 형태(2.3)로 먼저**, 또는 웹 라우트 탭 없이
- ★ `/study/create`, `/study/[id]`, `/study/[id]/members`
- ★ `/study/[id]/log/create` + 상세 로그 스트림 (일지 연결 옵션1 선행)
- ◆ 홈/탐색 스터디 노출, ◆ `/diary`·`/diary/[id]` 다형 렌더
- 게스트 열람(스터디 목록/상세) — `fab9ea8` 패턴 확장

### 후속 확장

- 스터디를 **네이티브 중앙 탭 승급**(2.2, 챌린지 탭 재편) — 네이티브 작업
- ★ `/study/[id]/chat` + `/chat` 인박스 — **실시간 인프라 신규(무거움)**
- 공식/큐레이션 스터디(admin), 마이/회원 프로필 "참여 스터디" 고도화
- 채팅 인박스, 챌린지 "승급" 플로우

---

## 부록: 근거

- 하단 네비 5탭: `src/app.component/layout/AppBottomNav.tsx:26-37` (상단: `AppTopNav.tsx:26-35`)
- 탭 노출/활성/뒤로가기: `src/app.component/layout/AppLayoutShell.tsx:62-70(isBottomNavVisible), 71-88(resolveActiveNavId), 90+(needsBackButton)`
- 네이티브 브리지(IndexedStack/native:navigate): `src/app.component/layout/NativeBridge.tsx:31-40`
- 탐색 게스트 열람/공식 챌린지: `src/app.feature/explore/screen/ExploreScreen.tsx:25,124`, `explore/hooks/useExploreOfficialChallenges.ts`
- 게스트 상세 개방/홈 CTA: `commit fab9ea8`, `commit 0618ef4`(`home/screen/HomeScreen.tsx`)
- 스터디 일지 연결/스트릭/null-가드(별도 산출물 옵션1): 서버 `member/service/MemberService.java:189`, `diary/service/DiaryService.java:288,713`, `AdminDiaryService.java:180`
- 하이브리드 오프셋 이력: `commit 62ac5b0, ac5bc39`
- ⚠️ 불확실: 채팅 실시간 인프라 코드 미확인(신규 필요), 네이티브(Flutter) 레포는 본 저장소 밖(탭 작업량 추정), 챌린지 탭 강등의 사용률 영향은 실측 데이터 부재 → 출시 후 모니터링
