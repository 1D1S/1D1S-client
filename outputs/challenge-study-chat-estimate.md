# 챌린지/스터디 그룹 채팅 — 도입 비용·설계 견적서 (개정판 v3)

> 대상: 챌린지(=스터디, 동일 도메인) 참여자 그룹 채팅 · **웹과 Flutter 앱 양쪽에서 동작 필수**
> 범위: **그룹 1개 = 채팅방 1개**, 승인 참여자(`PARTICIPANT`/`HOST`)만 read/write. 1:1 DM 아님.
> 작성일: 2026-07-19 · 요금 조사일: 2026-07 (2025~2026 공개 요금) · 코드 수정 없음
> 근거 레포: 클라 `/Users/nogeun/1D1S-client`, 서버 `/Users/nogeun/1D1S-server-v2`, **Flutter 셸 `/Users/nogeun/_1d1s_app`**
>
> **v3 개정 요지:** **Firebase(BaaS) 채팅을 정식 3번째 옵션으로 추가**(§1.8 설계, §2.5 사용량 월비용, §2.6 3-way 비교, §3 공수) → 수만 MAU·운영비 민감·하이브리드 조건에서 **Firebase(Firestore+FCM)를 스윗스팟으로 추천 재도출**(§4). Firestore fan-out read 함정도 정량 판정.
> **v2 요지(유지):** ① "웹 1벌 + Flutter WebView 재사용(write-once)" 정식 분석(§1.7) ② 채팅 MAU 상한을 **수만(≤3만)** 으로 현실화 ③ **self-host 미정당**.

---

## 0. 한눈에 보기 (TL;DR)

| 항목 | 결론 |
|---|---|
| **프론트 구현 방식** | **웹으로 채팅 1벌 구현 → Flutter는 기존 WebView 셸로 그대로 렌더(write-once).** 네이티브 채팅 UI 별도 제작은 비권장 |
| **최종 추천 (v3 갱신)** | **Firebase(Firestore + FCM)를 스윗스팟으로 채택.** 수만 MAU + 운영비 민감 + 하이브리드 푸시 요구에 가장 부합. 단 채팅 UI 직접 구현 + fan-out read 규율 전제. **속도·기능 완성도 최우선이면 Stream이 대안** |
| **월비용(채팅 MAU 3만 기준)** | **Firebase ~$35~50**(정상 fan-out) · **Buy(Stream/Sendbird) $1,200~1,600** · Self-host 인프라 $300~800+상시 인건비 |
| **개발 공수 MVP / 누적** | Buy **3.5~5 / 7.5~12** · **Firebase 5.5~7.5 / 11.5~16.5** · Self-host 6.5~9 / 14.5~21 (wk, 웹 1벌) |
| **하이브리드 최대 리스크** | ① 백그라운드/종료 시 **웹 푸시 불가 → 네이티브 FCM/APNs 신설 필요**(서버·Flutter 모두 미구현). **Firebase 안은 FCM이 무료로 이걸 정면 해결** ② 인앱 소켓은 대체로 유지되나 **저사양 Android 백그라운드 eviction·종료 시 소멸 → 백그라운드 수신은 네이티브 푸시로만 보장** |
| **Firestore fan-out 함정 판정** | **현실 위험이나 결론을 뒤집진 않음.** 규율(리스너 `limit()`·해제, presence는 RTDB 분리) 지키면 3만 MAU ~$50/mo. 병리적 폭증(무제한 컬렉션 리스너)마저도 ~수백$/mo로 Buy 미만 → 코드리뷰로 관리할 엔지니어링 리스크지 요금 리스크 아님 |
| **Self-host 판정** | **미정당.** 수만 MAU에서 이점 없음(공수·운영 최대). Firebase가 "관리형 저비용"을 이미 제공 |

> `(추정)` = 벤더 미공개 협상 구간 또는 트래픽 가정 의존. §2.4·§2.5 참조.

---

## 1. 설계 스케치 (소스 근거)

### 1.1 도메인 매핑 — 방 = 챌린지
서버에 **Study 도메인 없음.** "스터디"는 단일 `Challenge` 엔티티 (`domain/challenge/entity/Challenge.java`).

| 개념 | 서버 근거 | 매핑 |
|---|---|---|
| 채팅방 ID | `Challenge`(`@Table("challenge")`, ID `Long` IDENTITY) `Challenge.java:26-31` | **1 room = 1 `Challenge.id`** |
| 방장 | `@ManyToOne Member hostMember` `Challenge.java:81-83` | room-owner 불필요, 재사용 |
| 방 대상 | `participationType ∈ {INDIVIDUAL, GROUP}` `Enum/ParticipationType.java` | **`GROUP` 만 방 생성** (INDIVIDUAL은 솔로, 탈퇴 시 챌린지 soft-delete `ChallengeService.java:759-762`) |

클라도 챌린지 피처는 `src/app.feature/challenge/` 단일, 채팅 모듈 전무 → 그린필드.

### 1.2 방 멤버십 ↔ 참여자 라이프사이클 동기화
**방 read/write 권한 = 기존 "승인 참여자" 규칙과 1:1 일치.** 별도 멤버십 테이블 불필요.

상태 enum (`Enum/ParticipantStatus.java:8-15`): `PENDING, REJECTED, PARTICIPANT, HOST, LEAVE, NONE`
읽기 자격 규칙은 이미 서버 전역: `승인 = HOST OR PARTICIPANT` (`ChallengeService.java:786,1064,1210`).

동기화 훅 — 전이 4메서드가 정확한 조인 포인트 (전부 `ChallengeService.java`, 이미 인라인 알림 호출 중):

| 전이 | 메서드:라인 | 채팅 액션 |
|---|---|---|
| 승인→`PARTICIPANT` | `acceptParticipant`:652 (→`notifyChallengeApproved`:667) | 방 입장 |
| 거절→`REJECTED` | `rejectParticipant`:672 (→:681) | 접근 불가 |
| 탈퇴→`LEAVE`(GROUP) | `leaveChallenge`:753 (:773) | 방 퇴장 |
| 방장 위임/탈퇴 | `leaveChallengeHost`:779 (:800/:824) | HOST 이전+퇴장 |
| 계정 탈퇴 | `withdrawMemberLeaveChallenge`:732-737 | 전 방 퇴장 |

→ side-effect 패턴 확립돼 있어 **동기화 저리스크.** Buy면 이 지점에서 벤더 `addMembers/removeMembers`, Build면 매 요청 시 status 게이트.

> ⚠️ **불확실:** 서버 enum엔 `ACCEPTED`가 없고 클라 타입엔 있음 (`board/type/challenge.ts:24-30` = `NONE|PENDING|REJECTED|ACCEPTED|HOST|PARTICIPANT`). 구현 전 "승인=어떤 값" 확정 필요.

### 1.3 권한·인증 (WebSocket 핸드셰이크 함의)
- 서버: **JWT 쿠키 우선** — `JwtAuthenticationFilter`가 `"id"` claim→`memberId`, `MemberPrincipal.getId()`가 memberId (`JwtAuthenticationFilter.java:45-76`, `JwtTokenProvider.java:218-221`). 쿠키 우선 + Bearer 폴백.
- 클라: 전 axios `withCredentials:true`, Authorization 헤더 없음 (`client.ts:13`).
- **WS/STOMP 핸드셰이크:** same-origin이면 access-token 쿠키 자동 동봉 → `HandshakeInterceptor`에서 `JwtTokenProvider` 재사용해 memberId 해석(신규지만 소규모). WebView도 쿠키 공유. 단 stateless·네이티브 토큰갱신 위임 → **장수명 WS는 401 재핸드셰이크 스토리 필요**(§1.7-B).

### 1.4 메시지 모델
Postgres+Flyway 신규 테이블 (`application.yml:9,19,27`):
```
message(id BIGINT PK, challenge_id FK, sender_id FK, content TEXT, created_at TIMESTAMPTZ,
        idx(challenge_id, created_at); 확장: type/attachment_url/deleted_at/edited_at)
message_read(challenge_id, member_id, last_read_message_id)   -- 미읽음(확장)
```
기존 offset/cursor 페이징·`requestData`/`buildQueryString` 재사용 (`request.ts:24,36`).
> **Buy면 이 테이블 불필요** — 저장/히스토리/검색은 벤더 보유.

### 1.5 알림 (기존 notification 재사용 여부)
**배지/목록은 재사용 가능, 백그라운드 실시간 전달은 별개(§1.7-A).**
- 서버 notification 도메인 완비 (`Notification.java:19-27`, `NotificationService.createNotification:403`→`dispatch:449`). 채팅용은 **enum 값 1개 추가**(`CHALLENGE_CHAT_MESSAGE`) + `resolvePushTitle` case(`Notification.java:122-130`) + `notifyChatMessage` 헬퍼.
- 클라 notification 피처(`src/app.feature/notification/`)도 타입 추가만으로 목록/미읽음 재사용.
- ⚠️ 한계: `createNotification`은 **동기(@Async 미사용)+수신자별 fan-out** → 채팅 볼륨엔 async/배칭 필요(확장 비용). 그리고 **네이티브 푸시 미구현**(§1.7-A) — 서버 실동작 채널은 Web Push(VAPID)뿐, FCM/APNs는 로그 stub(`FallbackAppPushSender.java`/`FallbackApnsSender.java`).

### 1.6 실시간 전송 — 양쪽 레포 모두 net-new
| 항목 | 서버 | 클라 |
|---|---|---|
| WebSocket/STOMP | 의존성·`@EnableWebSocketMessageBroker` 등 grep=0 | realtime SDK 전무, `new WebSocket`/`EventSource` grep=0 |
| Redis pub/sub | `RedisConfig.java:11` 전체 주석("추후 사용"), `redis.*` yml 없음 → 실사용 0 | — |
| 리스트 가상화 | — | `react-window`/`@tanstack/react-virtual` 없음 → 추가 필요 |

→ 실시간 계층 전체 신규.

---

## 1.7 ★ 핵심: "웹 1벌 + Flutter WebView 재사용" vs "네이티브 채팅 UI 별도 제작"

이 앱은 **하이브리드 WebView 셸**이다. Flutter(`_1d1s_app`, `webview_flutter ^4.10.0`)가 Next 웹을 렌더하고, 성숙한 JS 브릿지로 네이티브 기능을 위임한다.

- JS 채널 `OneDayOneStreakNative` (`web_bridge.dart:402 kJsChannelName`), 네이티브→웹 내비 `__NATIVE_NAV__`(:856), 피처 핸드셰이크 `window.__1D1S_FEATURES__`(:783).
- 처리 메시지 타입(`web_bridge.dart:475-579`): `auth_state, nav_state, app_ready, oauth_open, token_refresh, logout, story_open, date_picker_open, photo_picker_open, push_route, image_viewer_open, popup_open, modal_open` (+`native:navigate`, `native:token_refresh_result`).
- 클라 측 대응: `src/app.module/utils/nativeBridge.ts`, `useIsNativeApp.ts`, `NativeBridge.tsx`.

### 두 안 비교

| 기준 | **A. 웹 1벌 + WebView 재사용 (권장)** | B. 네이티브 채팅 UI 별도 제작 |
|---|---|---|
| 프론트 코드베이스 | **웹 1벌** (Flutter는 렌더만) | 웹 + Flutter 2벌 |
| 개발 공수(프론트) | 웹 2~2.5wk + Flutter 0.5wk | 웹 2.5wk + Flutter 3~5wk |
| 유지보수 | 단일 진실원 | 이중 유지(기능/버그 2배) |
| UX 품질 상한 | WebView 한계(키보드/스크롤 튜닝 필요) | 네이티브 최상 |
| 기존 브릿지 활용 | `photo_picker_open`·`push_route` 즉시 재사용 | 별도 네이티브 구현 |

**결론: A(웹 재사용)를 1순위로 채택.** 채팅은 표준 리스트+컴포저 UI라 WebView로 충분하고, 이 레포의 브릿지 자산(사진 선택·딥링크)이 이미 A를 뒷받침한다. B는 UX 최상이나 공수·유지비 2배로, 수만 MAU 규모의 부가기능엔 과투자.

### A안의 하이브리드 특유 이슈 (근거 기반)

**A. 백그라운드/종료 시 메시지 수신 — 최대 리스크 (네이티브 푸시 신설 필요)**
- 웹 푸시(Service Worker)는 **WebView가 죽으면 앱을 깨우지 못한다.** 그런데 `_1d1s_app` pubspec에 **`firebase_messaging`/FCM/APNs 없음**(webview_flutter·app_links·image_picker만 존재), 서버 FCM/APNs도 stub(§1.5).
- → **net-new 필수:** Flutter `firebase_messaging`(+iOS APNs) 통합 → FCM 토큰을 브릿지 신규 메시지(`push_token`)로 웹/서버에 전달 → 서버 FCM sender un-stub. **가장 큰 네이티브 확장 항목.**
- 완화 자산: 알림 탭 딥링크는 이미 **`push_route`(`web_bridge.dart:550`) + `app_links ^6.4.1`** 존재 → "챌린지 X 방 열기"는 대부분 배선돼 있음.
- **Buy 이점:** Stream/Sendbird의 Flutter SDK가 푸시 등록·페이로드를 상당 부분 대행 → 이 덩어리 축소.

**B. WebView 내 WebSocket 연결 유지 — 대체로 양호, 저사양 Android eviction만 리스크**
- 셸은 5개 WebView(home/explore/challenge/diary/mypage)를 **항상 살아있게 유지**한다 — `IndexedStack`이 아니라 모든 자식을 매 프레임 그리는 plain `Stack`(iOS 미도색 platform view detach 회피, `hybrid_shell.dart:1280-1320`). 탭 전환에도 JS·소켓·스크롤 상태 보존. 채팅을 6번째 탭/라우트로 넣으면 이 always-alive를 그대로 상속.
- **resume 시 reload하지 않는다** — `didChangeAppLifecycleState`(`hybrid_shell.dart:1072-1081`)의 `resumed`는 **핸드셰이크만 재주입**. → **인앱 WebSocket은 포그라운드/백그라운드 전환에도 대체로 유지**된다(당초 우려보다 유리).
- `reload()` 호출은 **① 사용자 pull-to-refresh**(`:341`)와 **② 저사양 Android가 백그라운드 WebView를 OS 차원에서 evict → 재방문 시 reload**(`:74-75,1291-1293`)뿐. 즉 소켓이 끊기는 경우는 사용자 새로고침 또는 저사양 기기 백그라운드 eviction으로 한정.
- 함의: 그래도 **백그라운드/종료 수신은 소켓으로 보장 불가**(eviction·종료 시 JS 소멸) → **백그라운드는 네이티브 푸시(A), 포그라운드는 소켓** 이원화가 정답. 관리형 SDK의 자동 재연결·오프라인 싱크가 eviction 후 복구를 흡수(Build 대비 이점).

**C. 파일·이미지 첨부 — 부분 재사용 가능**
- `webview_flutter`는 `<input type=file>` 파일 선택이 제한적. 하지만 **`photo_picker_open`(`web_bridge.dart:534`) + `image_picker ^1.2.2`** 네이티브 사진 선택 브릿지가 이미 있음 → 채팅 이미지 첨부에 재사용. 카메라/비이미지 파일은 브릿지 확장 필요(소규모).

**D. 방 진입 딥링크 — 인앱 라우팅은 배선됨, OS 딥링크는 부분**
- 인앱: `push_route`(:550)→`_handlePushRoute`(`hybrid_shell.dart:561-612`)가 별도 warm WebView로 push. 알림 벨이 이미 `_handlePushRoute('/notification')`(:1180) 사용 → **`_handlePushRoute('/challenge/X/chat')` 로 방 열기 즉시 가능.**
- ⚠️ OS 딥링크(알림 탭→앱): `app_links ^6.4.1`은 현재 **OAuth 콜백 전용**(`onedayonestreak://auth/callback`만 허용, `:639-649`). **cold-start 미처리**(warm `uriLinkStream`만, `getInitialLink` 없음). → 종료 상태 알림 탭→특정 방 진입은 **scheme 분기 + cold-start 핸들링 net-new**(소규모).

**E. iOS App-Bound Domains — 새 호스트면 net-new 제약**
- iOS WebView가 `limitsNavigationsToAppBoundDomains: true`(`hybrid_shell.dart:190-197`). → 채팅이 **별도 호스트**(벤더 도메인/별도 WS 호스트)로 통신하면 `Info.plist` `WKAppBoundDomains`(최대 10개)에 추가해야 하며 미등록 시 내비게이션 차단. **우리 웹 앱 same-origin이면 무이슈.** 관리형 SDK가 자체 도메인으로 붙으면 이 항목 확인 필요.

**F. 키보드/스크롤/입력 UX — 부분 양호, iOS 폴리시 필요(불확실)**
- Android는 `android:windowSoftInputMode="adjustResize"`(`AndroidManifest.xml:25`) 설정돼 컴포저용으로 적절. 컴포저는 WebView 내 웹 렌더라 키보드 UX는 웹 앱 책임.
- ⚠️ iOS WKWebView의 `contenteditable`/`textarea` 포커스 스크롤·액세서리 바 등 알려진 quirk는 셸에서 별도 처리 없음 → 고정 컴포저 실기기 QA 필요(폴리시, 비차단).

**G. 안전한 롤아웃**
- `__1D1S_FEATURES__` 핸드셰이크(:783)로 신규 브릿지 메시지가 **구버전 셸에서 graceful degrade** → 웹/앱 배포 비동기여도 안전.

---

## 1.8 ★ 옵션 C — Firebase(BaaS) 채팅 설계

관리형 SDK(Stream/Sendbird)의 MAU 정액 과금이 부담될 때의 대안. 실시간 DB·인증·푸시를 Google이 관리하되 **채팅 로직/UI는 직접** 구현한다. Self-host와 Buy의 중간.

### 1.8.1 Firestore vs Realtime Database — 그룹 채팅엔 Firestore 권장

| 축 | **Cloud Firestore (권장)** | Realtime Database (RTDB) |
|---|---|---|
| 과금 | **작업당**: read $0.06/10만, write $0.18/10만, delete $0.02/10만, 저장 ~$0.18~0.26/GB, egress 10GiB/mo 무료 후 ~$0.12/GB | **대역폭/저장**: 저장 $5/GB, 다운로드 $1/GB. 동시연결 100(무료)/최대 20만 per DB |
| 쿼리 | 방별 컬렉션 + `limit()`/커서 페이징, 복합 인덱스 | 단일 JSON 트리, 쿼리 빈약, 샤딩 수동 |
| 확장 | 자동 샤딩·수평 확장 | 대규모 시 수동 샤딩 필요 |
| Security Rules | 문서/컬렉션 단위 정교(멤버십 검증에 적합) | 경로 기반, 상대적으로 단순 |
| 적합 | **방 기반 그룹 채팅·히스토리 페이징·모더레이션** | 초고빈도 presence/typing·저지연 커서 |

**결론:** 메시지 저장·방별 페이징·멤버십 규칙이 핵심인 그룹 채팅은 **Firestore**가 적합. RTDB는 대역폭 과금이라 presence/typing 하트비트엔 유리 → **확장 단계에서 presence만 RTDB 분리**하는 하이브리드가 정석(fan-out read 절감에도 기여, §2.5). MVP는 Firestore 단일.

### 1.8.2 방=챌린지 매핑 · 스키마
```
challengeRooms/{challengeId}                       // 방 = Challenge.id (Long → string)
  ├─ members/{memberId}   { role: 'HOST'|'PARTICIPANT', joinedAt }   // 서버가 동기화, 규칙의 근거
  ├─ messages/{messageId} { senderId, content, type:'text', createdAt(serverTimestamp) }
  └─ reads/{memberId}     { lastReadMessageId, lastReadAt }          // 미읽음(확장)
```
`GROUP` 챌린지만 방 생성(§1.1). 메시지는 클라가 직접 Firestore에 write(서버 경유 안 함) → 실시간 반영. **읽기 리스너엔 반드시 `orderBy(createdAt desc).limit(N)`** 부여(§2.5 fan-out 방지).

### 1.8.3 권한 — Security Rules로 강제 + 커스텀 토큰 필요
우리 인증은 **서버 JWT(쿠키), memberId=Long**(`MemberPrincipal.getId()`)이고 Firebase Auth가 아니다. → **Firebase Admin SDK로 커스텀 토큰 발급이 필수:**
1. 클라가 서버에 "채팅 토큰 요청" → 서버(Spring, Firebase Admin SDK)가 `createCustomToken(memberId)` 발급.
2. 클라 `signInWithCustomToken()` → Firebase `request.auth.uid = memberId`.
3. **방별 멤버십은 클레임에 못 담는다**(수백 챌린지·동적) → `members/{memberId}` 문서를 **서버가 동기화**(§1.2 전이 4메서드에서 문서 add/remove), Security Rules가 그 문서 존재로 게이트:
```
match /challengeRooms/{cid}/messages/{mid} {
  allow read:   if exists(/databases/$(db)/documents/challengeRooms/$(cid)/members/$(request.auth.uid));
  allow create: if exists(/.../members/$(request.auth.uid))
                && request.resource.data.senderId == request.auth.uid;
  allow update, delete: if false;   // 필요 시 본인 메시지 한정 완화
}
```
→ "승인된 PARTICIPANT/HOST만 read/write"가 규칙으로 강제. 멤버십 동기화는 Buy webhook과 동일한 4개 조인 포인트(§1.2) 재사용. `exists()` 자체가 read 1회 과금이나 규칙 평가 read는 소량.

### 1.8.4 FCM 통합 — 백그라운드/종료 수신을 무료로 해결
§1.7-A의 최대 리스크(웹 푸시로 죽은 앱 못 깨움)를 **FCM이 정면 해결. FCM 메시지 전송 자체는 무제한 무료.**
- 클라: Flutter `firebase_messaging` 통합(§1.7-A와 동일한 네이티브 작업) — 토큰 획득 → 서버/Firebase에 등록. 알림 탭 → `push_route('/challenge/X/chat')`(이미 배선, §1.7-D).
- 서버 트리거 2안:
  - **(a) Cloud Functions on Firestore write** — 메시지 문서 생성 시 트리거 → 방 멤버 토큰으로 FCM fan-out. 메시지가 클라→Firestore 직행이라 **서버가 경로에 없으므로 이 방식이 자연스러움.** 호출 비용: 3만 MAU 가정 ~450만 호출/mo, 무료 200만/mo 후 ~$0.40/M → **~$1/mo**(미미).
  - (b) 기존 Spring이 FCM 전송 — 메시지가 서버를 안 거치므로 별도 write 알림 경로가 필요 → 부자연. Cloud Functions 권장.
- 서버 기존 FCM stub(`FallbackAppPushSender.java`)은 이 경로에선 불필요(Functions가 대행).

### 1.8.5 무엇을 직접 만들어야 하나 (Buy 대비 추가 부담)
Firebase는 **전송·저장·인증·푸시**만 준다. **채팅 UX는 전무** → 직접 구현: 메시지 리스트(가상화·페이징), 컴포저, **읽음/미읽음, 타이핑 인디케이터, 신고/차단·모더레이션 UI**. 이게 Buy(UIKit 내장) 대비 프론트 공수 증가분의 실체(§3).

---

## 2. Build vs Buy vs Firebase 비교

### 2.1 관리형 SDK 요금 (웹 실조사, 2025~2026)
> MAU = "그 달 채팅 서버에 connect한 유니크 유저"(Stream/Sendbird 명시). 우리 채팅 MAU = **그 달 방을 연 승인 참여자** ≤ 앱 MAU.

| 벤더 | 유형 | 무료 | 과금 | 출처 |
|---|---|---|---|---|
| **Stream** | 풀 채팅(React·Flutter UIKit·모더레이션) | Build **1,000 MAU 무료**, 100 동접(+Maker $100) | Start 10K **$399**·25K $1,049·50K $1,849(연). 오버리지 $0.07~0.09/MAU | [getstream.io/chat/pricing](https://getstream.io/chat/pricing/) |
| **Sendbird** | 풀 채팅(UIKit·모더레이션) | Developer **1,000 MAU 무료**, 20 동접 | Starter 5K **$349**·10K **$499**·25K **$1,199**(연); Pro 5K $499·10K $749·25K $1,799 | [sendbird.com/pricing/chat](https://sendbird.com/pricing/chat) |
| **PubNub** | 실시간 인프라(+Chat SDK) | **200 MAU 무료** | MAU 기반, 메시지 무제한. Starter **$98(1K MAU)**; 이후 custom | [pubnub.com/pricing](https://www.pubnub.com/pricing/) |
| **Ably** | 실시간 인프라(+Chat SDK), **채팅 로직 직접** | Free 6M msg·200 동접 | 사용량제(msg $2.5/M) 또는 MAU **$0.05/user**; Standard $29·Pro $399 +사용량 | [ably.com/pricing](https://ably.com/pricing) |

성격: **Stream/Sendbird = 풀 채팅**(저장·읽음·모더레이션·UIKit 포함). **PubNub/Ably = 전송 인프라**(저장/모더레이션/UI 직접, half-build).

### 2.2 시나리오별 월비용 — 수만 MAU 상한 기준 (핵심 재정리)

| 채팅 MAU | **Stream** | **Sendbird** | PubNub | Ably | 비고 |
|---|---|---|---|---|---|
| **1,000** | **$0** | **$0** | $98 | $0~29 | 무료티어로 검증 |
| **5,000** | **$399** (10K entry) | **$349** | ~$300~500(추정) | ~$280(추정) | Sendbird 최저 |
| **10,000** | **$399** | **$499** | ~$500~1,000(추정) | ~$530(추정) | Stream 최저 |
| **30,000** | **$1,200~1,400**(추정, 25K $1,049↔50K $1,849 사이) | **$1,300~1,600**(추정, 25K $1,199↔50K contact) | ~$1,500~3,000(추정) | ~$1,500(MAU) / 저빈도면 사용량제 더 저렴 | **협상 시작 구간** |
| *(참고) 100,000* | *$3,000~5,000+(Enterprise)* | *$2,000~4,000+(Enterprise)* | *~$3,000+* | *$1,000~5,000* | **상한 밖 — 참고만** |

핵심: **우리 상한(≤3만)에서 관리형은 월 $0~1,600.** 연 환산 최악 **≈ $15k~19k**(3만 지속 시).

### 2.3 Self-host 구성·인프라(요약)
- 컴포넌트(net-new): STOMP starter+broker+핸드셰이크 인증, 메시지/읽음 엔티티+마이그레이션, **Redis pub/sub**(주석 config 해제+프로비저닝), 클라 WS+재연결+가상화.
- **+ 저사양 Android WebView eviction/재방문 reload 대응 재연결 하드닝**(§1.7-B) +1~2wk.
- 인프라 추가분(추정): 1천~1만 **$50~300/mo**, 3만 **$300~800/mo** (Redis small + 동접용 인스턴스 증설 + 기존 Postgres). **진짜 비용은 인프라가 아니라 상시 엔지니어 시간**(온콜·모더레이션·스케일).

### 2.4 가정/불확실성
- 채팅 MAU ≠ 앱 MAU(참여자 한정) → 위 표는 채팅 MAU 직접 대입, 실제 더 낮을 수 있어 과대추정 여지.
- 5K는 Stream에 전용 티어 없어 10K 진입가($399) 적용. 30K/100K는 전부 협상 추정.
- 저빈도 그룹챗은 동접·메시지 사용량이 낮아 Ably/PubNub 사용량제가 유리할 수 있으나, 저장·모더레이션·UI 직접 구현 부담이 상쇄.

### 2.5 Firebase(Firestore) 사용량 기반 월비용 실산정

**가정 (표에 노출 — 실측 아님, 조정 가능)**

| 파라미터 | 값 | 근거/주석 |
|---|---|---|
| 채팅 MAU당 송신 메시지 | **150개/월** | 활성일 15일 × 10개/일 (그룹챗 중저빈도 가정) |
| 실시간 fan-out 계수 F | **6** | 메시지 1개당 그 순간 방에 접속·리스닝 중인 평균 인원(본인 echo 포함). 방 20명 중 ~6명 동시 온라인 가정 |
| 실시간 수신 read | 150 × F = **900/MAU·월** | write × 동시 리스너. **fan-out의 핵심** |
| 히스토리/재조회 read | **500/MAU·월** | 앱 재진입 시 최근 메시지 `limit(N)` 로드 |
| **총 read** | **≈ 1,400/MAU·월** | 900 + 500 |
| **총 write** | **150/MAU·월** | = 송신 메시지 |
| 메시지 크기 | ~300 B | 텍스트 + 메타 |
| Spark 무료(Blaze 유지) | read 50k/일(≈1.5M/월), write 20k/일(≈0.6M/월), 저장 1GB, egress 10GiB/월 | 일일 리셋 |

**시나리오별 월비용 (Firestore Blaze, 무료할당 차감 후)**

| 채팅 MAU | write/월 | read/월 | write 비용 | read 비용 | 저장+egress | **합계(정상 fan-out)** |
|---|---|---|---|---|---|---|
| **1,000** | 15만 | 140만 | $0(무료내) | $0(무료내) | ~$0 | **≈ $0** (Spark 내) |
| **5,000** | 75만 | 700만 | ~$0.3 | ~$3.3 | <$1 | **≈ $4~10** |
| **10,000** | 150만 | 1,400만 | ~$1.6 | ~$7.5 | ~$1~5 | **≈ $10~20** |
| **30,000** | 450만 | 4,200만 | ~$7 | ~$24 | ~$4~15 | **≈ $35~50** |

> 단가: read $0.06/10만, write $0.18/10만, 저장 $0.18~0.26/GB, egress 10GiB/월 무료 후 ~$0.12/GB. **FCM 전송·인증은 무료. Cloud Functions ~$1/mo(§1.8.4).** → **관리형 SDK(3만 $1,200~1,600) 대비 20~40배 저렴.**

**⚠️ fan-out read 폭증 함정 (반드시 짚을 리스크)**
- Firestore read는 **`메시지 수 × 동시 리스너 수`** 로 곱셈 증가. 그룹채팅의 구조적 특성상 read가 비용을 지배(위 표에서 read가 write의 ~9배).
- **최악의 안티패턴:** `messages` 컬렉션 전체에 `limit()` 없이 `onSnapshot` 리스너를 걸면, 새 메시지 1개마다 **컬렉션 전체가 재전송 → O(n²) read**. 방 히스토리가 쌓일수록 폭증. 리스너 미해제(언마운트 후 잔존)도 중복 과금.
- **정량 판정:** 병리적 가정(50개/일·25일, F=20 전원 온라인, 그래도 `limit` 은 있음)으로 3만 MAU를 돌려도 read ~8억/월 ≈ **~$500/mo** — 여전히 Buy($1,200~1,600) **미만**. 즉 **`limit()` 없는 무제한 리스너 버그**가 아닌 한 요금이 Buy를 넘기 어렵다.
- **결론:** fan-out은 **엔지니어링 규율로 관리할 리스크지 요금 모델 리스크가 아니다.** 필수 규율 ①리스너 `orderBy().limit(50)` ②언마운트 시 detach ③presence/typing은 Firestore 말고 RTDB나 클라 로컬 ④페이지네이션 커서. 코드리뷰 체크리스트로 강제.

**가정 민감도:** 위 값은 F(동시 리스너)와 메시지량에 선형~곱셈 의존. 실트래픽 측정 전까지 **±3배 밴드**로 볼 것. 그래도 3만 MAU에서 $35~150 범위라 Buy와의 격차(수십 배)는 유지.

### 2.6 3-way 비교표 (갱신)

| 축 | **Buy (Stream/Sendbird)** | **Firebase (Firestore+FCM)** | Self-host (WebSocket) |
|---|---|---|---|
| 월비용 @3만 MAU | $1,200~1,600 | **~$35~50**(폭증 시 ~$500, 여전히↓) | 인프라 $300~800 **+ 상시 인건비** |
| 월비용 @1천 | $0 | **$0**(Spark) | 인프라 $50~300+인건비 |
| 개발 MVP | **3.5~5 wk** | 5.5~7.5 wk | 6.5~9 wk |
| 개발 누적 | **7.5~12 wk** | 11.5~16.5 wk | 14.5~21 wk |
| 운영 부담 | **최저**(완전 SaaS) | 낮음(BaaS+Functions 관리, 서버 없음) | **높음**(온콜·스케일·모더레이션 자체) |
| 기능 완성도 | **최고**(UIKit·읽음·타이핑·검색·모더레이션 내장) | 낮음(전부 직접 구현) | 낮음(전부 직접) |
| 하이브리드 푸시 해결 | 벤더 SDK 대행 | **FCM 네이티브·무료로 정면 해결** | 직접(FCM 통합) |
| 벤더 락인 | **높음**(독자 API·데이터 이관 난이도) | 중(Firebase 종속이나 표준 패턴·이관 용이) | **없음**(자체 소유) |
| 확장성 | 벤더 보장 | 자동 샤딩 | 직접(Redis pub/sub·인스턴스) |
| fan-out/비용 리스크 | 없음(MAU 정액) | **read 폭증 함정**(규율 필요) | 없음(고정 인프라) |

---

## 3. 개발 공수 (person-week) — 웹 1벌 기준 재산정

> A안(웹 재사용): **채팅 UI = 웹 1벌**, Flutter는 렌더+푸시/첨부 브릿지만.

### 3.1 MVP — 방 1개 + 실시간 텍스트
| 파트 | Buy(관리형) | **Firebase(BaaS)** | Build(self-host) |
|---|---|---|---|
| 서버 | **1.5~2.5** — 유저 토큰 발급 + 멤버십 동기화(4전이 훅) + 채널 매핑 | **2~3** — Admin SDK 커스텀토큰 발급 + Security Rules 설계 + 멤버십 문서 동기화(4전이 훅) | **3~4** — WS/STOMP+핸드셰이크 인증, 메시지 API, 게이트 |
| 웹(유일한 채팅 UI) | **1.5~2.5** — UIKit(stream-chat-react/Sendbird) 통합, 방 화면, 게이트 | **3~4** — Firestore SDK로 리스트+페이징+리스너(`limit`!)+컴포저 **직접**(UIKit 없음) | **3~4** — WS 클라/재연결, 리스트+가상화, 컴포저 |
| Flutter 셸 | **0.5** — WebView 렌더, 키보드 튜닝, `push_route` 재사용 | **0.5** — WebView 렌더(푸시는 확장) | **0.5~1** |
| **합계** | **≈ 3.5~5** | **≈ 5.5~7.5** | **≈ 6.5~9** |

### 3.2 확장 — 네이티브 푸시/읽음/타이핑/첨부/모더레이션
| 항목 | Buy | **Firebase** | Build |
|---|---|---|---|
| **네이티브 푸시**(최대 항목) | 2~3 (`firebase_messaging`+APNs+`push_token` 브릿지+서버 un-stub) | **2~3** (`firebase_messaging` + Cloud Functions FCM fan-out + `push_route`) | 2~3 |
| 읽음/미읽음·타이핑 | 0.5~1(SDK 내장) | **2~3**(직접: `reads` 문서·인디케이터) | 2~3 |
| 미디어 첨부(`photo_picker_open` 재사용) | 0.5~1 | **0.5~1**(+Firebase Storage) | 1~2 |
| 신고/차단·모더레이션 | 1~2(벤더 내장) | **1.5~2**(직접 구현) | 2~3 |
| 알림 async fan-out·스케일 | N/A | N/A(Firebase 관리) | 1~2 |
| **합계** | **≈ 4~7** | **≈ 6~9** | **≈ 8~12** |

### 3.3 요약
| 단계 | Buy | **Firebase** | Build |
|---|---|---|---|
| MVP | **3.5~5** | 5.5~7.5 | 6.5~9 |
| 확장 | 4~7 | 6~9 | 8~12 |
| **누적** | **7.5~12** | **11.5~16.5** | 14.5~21 |

> Firebase가 Buy보다 ~4주 더 드는 이유는 **채팅 UI/읽음/타이핑/모더레이션을 UIKit 없이 직접** 구현하기 때문(§1.8.5). 그 대가로 월비용이 수십 배 낮고 서버 실시간 인프라·운영이 없다.

---

## 4. 최종 추천 · 근거 · 롤아웃 (v3 재도출)

### 4.1 최종 추천: **Firebase(Firestore + FCM) 스윗스팟. 웹 1벌 + WebView 재사용.**

전제 조건 3개(수만 MAU 상한 · 운영비 민감 · 하이브리드 푸시 필수)에 가장 부합하는 안은 **Buy가 아니라 Firebase**로 재판정한다.

**근거:**
1. **비용 격차가 압도적**(§2.5) — 우리 상한(≤3만 MAU)에서 Firebase 월 **$0~50** vs Buy **$1,200~1,600**. 3만 지속 시 **연 $14k~19k 절감.** Firebase가 Buy보다 더 드는 개발 ~4주는 **첫해 안에 회수**되고 이후 절감이 매년 순증.
2. **하이브리드 최대 리스크를 무료로 정면 해결**(§1.8.4) — 백그라운드/종료 수신(§1.7-A)이 모든 안의 공통 난제인데, **FCM 전송이 무제한 무료**이고 Flutter `firebase_messaging`은 Firebase 네이티브 경로라 통합이 가장 매끄럽다.
3. **운영 부담 낮음** — 서버 실시간 인프라 없음(Firestore·FCM·Functions 전부 Google 관리). Self-host의 온콜·WS 스케일·Redis 부담 소멸. 서버는 커스텀토큰 발급 + 멤버십 문서 동기화(§1.8.3)만.
4. **fan-out 함정은 관리 가능**(§2.5) — 규율(리스너 `limit()`·detach, presence는 RTDB/로컬) 지키면 $50/mo, 병리적 안티패턴이어도 ~$500/mo로 **Buy 미만.** 요금 리스크가 아니라 코드리뷰 체크리스트로 막을 엔지니어링 리스크.
5. **멤버십 동기화 저리스크**(§1.2) — 승인=`HOST|PARTICIPANT` 규칙·side-effect 훅이 이미 존재 → Security Rules용 멤버십 문서 동기화를 같은 4개 조인 포인트에 부착.
6. **웹 재사용 성립·락인 낮음** — `photo_picker_open`·`push_route` 자산 재사용(§1.7), 프론트 웹 1벌. Firestore는 표준 문서 모델이라 Buy 독자 API 대비 이관 용이.

**필수 전제(지키지 않으면 추천 무효):** (a) 채팅 UI/읽음/타이핑/모더레이션 **직접 구현 공수 수용**(§1.8.5, Buy 대비 +~4주) · (b) 리스너 `limit()`/detach **fan-out 규율** · (c) Security Rules + Admin SDK 커스텀토큰 서버 작업.

### 4.2 언제 Buy(Stream)가 더 나은가 — 대안 조건
- **출시 속도 최우선**(MVP 2~4주 단축) + 연 $15k 부담 수용 가능할 때.
- **리치 기능 필수**(대규모 자동 모더레이션·메시지 검색·번역·읽음/타이핑 즉시 제공)일 때 — 이걸 직접 만들면 Firebase의 공수·유지 이점이 상쇄.
- 채팅 UI를 지속 유지보수할 프론트 여력이 부족할 때.
→ 이 경우 **Stream 1순위**(무료 1천·10K $399·재연결 내장), **Sendbird 2순위**(5K $349·한국 레퍼런스). PubNub/Ably는 저장·모더레이션·UI 직접 구현이라 후순위.

### 4.3 Self-host 판정 — **미정당**
- **이점 없음.** Firebase가 이미 "관리형 저비용 + 자동 확장 + 무료 FCM"을 제공하므로, 공수·운영이 최대인 self-host를 택할 경제적 이유가 사라졌다. 데이터 거주지(한국 리전) 강제 등 규제 특수 상황에서만 예외 검토.

### 4.4 단계적 롤아웃 (Firebase 기준)
1. **Phase 0 (0.5wk):** "승인=상태값" 확정(§1.2 불일치), `GROUP` 한정 확정, Firebase 프로젝트·Security Rules 초안·커스텀토큰 PoC.
2. **Phase 1 — Firebase MVP (5.5~7.5wk):** Firestore 방(1방=1챌린지), 규칙 게이트(승인 참여자만), 실시간 텍스트, 웹 1벌 → WebView 렌더. **리스너 `limit()` 규율 코드리뷰.** 소수 챌린지 파일럿, Spark 무료.
3. **Phase 2 — 확장 (6~9wk):** FCM 네이티브 푸시(`firebase_messaging` + Cloud Functions on write + `push_route` 딥링크), 읽음/미읽음·타이핑, 이미지 첨부(`photo_picker_open`+Firebase Storage), 신고/차단. Blaze 전환(여전히 월 수십 달러).
4. **Phase 3 — 모니터링:** read/write 사용량·**fan-out 대시보드**(폭증 조기 감지)·예산 알림. presence 필요 시 RTDB 분리(§1.8.1). 채팅 MAU가 **5만을 대폭 상회**하거나 리치 기능 한계에 부딪힐 때만 Buy/self-host 재검토.

**락인 완화:** Firebase 호출을 **클라 피처 훅 한 곳에 격리**해 후일 Buy/self-host 교체 표면적 최소화.

---

## 부록 A. 소스 근거 인덱스
**서버**(Spring Boot 3.5.4/Java 17/Postgres+Flyway `build.gradle:3,13`, `application.yml:9,19,27`)
- 챌린지 `Challenge.java:26-31,81-86` · 참여자 `Participant.java:21-35`/`ParticipantStatus.java:8-15`
- 전이 `ChallengeService.java:652,672,753,779,732-737` · 알림 `Notification.java:19-27,122-130`/`NotificationService.java:403,449`
- 실시간 부재 `build.gradle`(no websocket)/`RedisConfig.java:11`(주석) · 인증 `JwtAuthenticationFilter.java:45-76`/`JwtTokenProvider.java:218-221`
- 푸시 stub `FallbackAppPushSender.java`(FCM)/`FallbackApnsSender.java`(APNS), 실동작 `WebPushSender.java`

**클라이언트**(Next 16.2.10/React 19.2.4/TanStack Query v5)
- 참여자 `board/type/challenge.ts:24-30,88` · 뮤테이션 `detail/hooks/useChallengeMutations.ts:46,108,124,140`
- 알림 `notification/hooks/useNotificationQueries.ts:22,40` · realtime/가상화 부재(package.json)
- 브릿지 `src/app.module/utils/nativeBridge.ts`, `NativeBridge.tsx`, `useIsNativeApp.ts` · 인증 `api/client.ts:13`/`request.ts:24,36`

**Flutter 셸**(`_1d1s_app`, `webview_flutter ^4.10.0`, `app_links ^6.4.1`, `image_picker ^1.2.2`, **firebase_messaging/FCM/APNs 없음**)
- 브릿지 `lib/bridge/web_bridge.dart` — 채널 `kJsChannelName='OneDayOneStreakNative'`:402, 등록 :450-455, 메시지 타입 switch :474-599(`photo_picker_open`:534, `push_route`:550, `image_viewer_open`:556, `token_refresh`:499 …), 피처 핸드셰이크 `__1D1S_FEATURES__`:783-789, `__NATIVE_NAV__`(cancelable `native:navigate`):856-869
- 5-WebView always-alive plain `Stack`(not IndexedStack) :1280-1320 · lifecycle `hybrid_shell.dart:1072-1081`(resume=핸드셰이크 재주입, **reload 아님**) · `reload()`는 pull-to-refresh :341 + 저사양 Android eviction 재방문 :74-75,1291-1293
- iOS App-Bound Domains ON `hybrid_shell.dart:190-197`(새 호스트는 Info.plist `WKAppBoundDomains` 등록 필요) · 사진첨부 `photo_picker_open`→`app_photo_picker.dart:19-60`(base64 `native:photo_result`) · 딥링크 `_handlePushRoute` :561-612(벨 예시 :1180), OS 딥링크 app_links는 OAuth 콜백 전용 :639-649(cold-start 미처리) · Android `adjustResize` `AndroidManifest.xml:25`

## 부록 B. 요금 출처 (조사일 2026-07, 2025~2026 공개가; 협상가·50K↑ 재확인 필수)
- **관리형 SDK:** Stream https://getstream.io/chat/pricing/ · Sendbird https://sendbird.com/pricing/chat · PubNub https://www.pubnub.com/pricing/ · Ably https://ably.com/pricing
- **Firebase:** Firestore https://firebase.google.com/docs/firestore/pricing (read $0.06/10만·write $0.18/10만·delete $0.02/10만·저장 ~$0.18~0.26/GB, Spark 무료 read 50k·write 20k·delete 20k/일·저장 1GB·egress 10GiB/월) · RTDB https://firebase.google.com/docs/database/usage/billing (저장 $5/GB·다운로드 $1/GB, 무료 동시연결 100·저장 1GB·다운로드 10GB/월) · 요금 개관 https://firebase.google.com/pricing (FCM·Auth 무료)
- ⚠️ 일부 서드파티 요약은 Firestore read 단가를 $0.18/10만으로 잘못 표기 — Google 공식 기준 **read $0.06/10만**(write와 혼동 주의).
