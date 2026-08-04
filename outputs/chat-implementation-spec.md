# 챌린지 그룹 채팅 — 백엔드 구현 명세서

> 대상 독자: 백엔드 팀원(Spring) + 필요 시 프론트. **바로 착수 가능한 구현 지향 명세.**
> 확정 아키텍처(하이브리드): **읽기 = Supabase Realtime 구독(RLS 접근통제)** · **쓰기 = Spring 엔드포인트(참여자 검증 → insert → FCM 팬아웃)** · **Spring이 Supabase용 JWT 발급(브릿지)** · **백그라운드 알림 = FCM/APNs**.
> 작성일: 2026-07-19 · 서버 레포 `/Users/nogeun/1D1S-server-v2`, 클라 `/Users/nogeun/1D1S-client` · 코드 수정 없음(문서만).
> `file:line`은 실제 확인, `⚠️추정`은 미확인 표기.

---

## 0. 확정 사실 · 근거 스키마

| 항목 | 값 | 근거 |
|---|---|---|
| DB | **Supabase Postgres** | `application.yml:8-9` `jdbc:postgresql://…sslmode=require` |
| 마이그레이션 | Flyway `src/main/resources/db/migration`, 최신 `V44__add_banner.sql` → **신규 `V45__`** | 디렉토리 확인 |
| Spring/Java | Boot 3.5.4 / Java 17 | `build.gradle:3,13` |
| 앱 인증 | JWT HS256 쿠키(`accessToken`), `memberId=MemberPrincipal.getId():Long` | `application-security.yml:38-45`, `JwtAuthenticationFilter.java:45-76` |
| `member` | PK `member_id`(BIGINT IDENTITY) | `Member.java:26,39-42` |
| `challenge` | PK `id`(BIGINT), host FK `host_member_id`, `participationType`(INDIVIDUAL/GROUP), soft-delete `deletedAt` | `Challenge.java:29-31,60,77,82` |
| `participant` | PK `id`, `status`**@Enumerated(STRING)** `ParticipantStatus`, member FK 컬럼 **`memberId`**, challenge FK `challenge_id` | `Participant.java:24-35` |
| `ParticipantStatus` | `PENDING, REJECTED, PARTICIPANT, HOST, LEAVE, NONE` | `Enum/ParticipantStatus.java:8-15` |
| 승인 판정 규칙 | **`HOST` OR `PARTICIPANT`** (서버 전역 사용) | `ChallengeService.java:786,1064,1210` |
| 라이프사이클 전이 | accept:652 / reject:672 / leave:753 / hostLeave:779 / 계정탈퇴:732 | `ChallengeService.java`(각 메서드 이미 inline 알림 호출) |
| 기존 푸시 | Web Push(VAPID) 실동작, **FCM/APNs는 stub** | `WebPushSender.java`, `FallbackAppPushSender.java` |
| 디바이스 토큰 저장 | `notification_endpoint`(member_id, is_active 인덱스), 채널enum `{WEB_PUSH,FCM,APNS}` | `NotificationEndpoint.java:16-44`, `NotificationChannelType.java:4-6` |

> ⚠️추정: Spring이 Supabase Postgres에 접속하는 DB role은 **테이블 소유자(owner)** 로 가정한다(→ 소유자는 RLS 우회, §1.4). 실제 role 권한은 배포 담당이 확인할 것.
> ⚠️추정: `participationType` enum도 STRING 매핑으로 가정(Challenge.java에서 `@Enumerated` 미확인). 채팅방은 **`GROUP` 챌린지에만** 생성.

---

## 1. 데이터 모델 (DDL) — `V45__add_chat.sql`

Postgres/Supabase 기준. **JPA `ddl-auto: validate`** 이므로 마이그레이션이 정본이고 엔티티는 이에 맞춘다.

```sql
-- =========================================================
-- 1. 채팅방: 챌린지 1개 = 방 1개 (1:1). 방이 별도 PK를 갖게 해
--    향후 "챌린지당 다중 방" 확장 여지를 남긴다.
-- =========================================================
create table chat_room (
  id                 bigint generated always as identity primary key,
  challenge_id       bigint not null references challenge(id),
  pinned_message_id  bigint,                       -- 현재 상단 고정 공지(§7). FK는 아래서 추가
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint uq_chat_room_challenge unique (challenge_id)  -- 챌린지당 1방 강제
);

-- =========================================================
-- 2. 방 멤버십: participant 라이프사이클의 денорм 복제본.
--    RLS 평가/미읽음 저장의 단일 창구(§1.4, §6, §12).
--    승인된 상태(PARTICIPANT/HOST)만 행으로 존재.
-- =========================================================
create table chat_room_member (
  room_id               bigint not null references chat_room(id) on delete cascade,
  member_id             bigint not null references member(member_id),
  role                  varchar(20) not null,      -- 'HOST' | 'PARTICIPANT' (participant.status 미러)
  last_read_message_id  bigint,                    -- 미읽음 계산 기준(§6)
  muted                 boolean not null default false,
  joined_at             timestamptz not null default now(),
  primary key (room_id, member_id)
);
create index idx_crm_member on chat_room_member (member_id);  -- 내 방 목록/RLS 역방향

-- =========================================================
-- 3. 메시지: 확장성 핵심 — type + payload(JSONB) (§10).
--    content 는 텍스트 전용, 그 외 타입은 payload 에 담는다.
-- =========================================================
create table message (
  id                 bigint generated always as identity primary key,
  room_id            bigint not null references chat_room(id) on delete cascade,
  sender_id          bigint references member(member_id),   -- SYSTEM 메시지는 null 허용
  type               varchar(32) not null default 'TEXT',   -- TEXT|IMAGE|SYSTEM|ANNOUNCEMENT|REPLY|POLL...(§10)
  content            text,                                  -- TEXT/ANNOUNCEMENT 본문. 그 외 null 가능
  payload            jsonb not null default '{}'::jsonb,     -- 타입별 구조화 데이터(+schema_version)
  client_message_id  uuid not null,                         -- 멱등키(중복 전송 차단, §11)
  created_at         timestamptz not null default now(),    -- **서버 시간만 사용**(클라 시간 금지)
  edited_at          timestamptz,
  deleted_at         timestamptz,                           -- soft delete(모더레이션)
  constraint uq_message_client unique (room_id, sender_id, client_message_id)
);

-- 페이지네이션(과거 무한스크롤) + jump 앵커 + 정렬 안정성의 핵심 복합 인덱스.
-- 커서가 (created_at, id) 튜플이므로 정확히 이 순서로 인덱싱.
create index idx_message_room_created_id on message (room_id, created_at desc, id desc);
-- 미읽음 카운트(id 기준 범위 스캔) 및 jump 대상 조회.
create index idx_message_room_id on message (room_id, id);

-- 공지 고정 FK (2번 방 생성 후 순환참조 회피 위해 뒤에 추가)
alter table chat_room
  add constraint fk_chat_room_pinned foreign key (pinned_message_id) references message(id);
```

### 1.4 RLS 정책 (읽기 접근통제)

읽기는 클라이언트가 **Spring이 발급한 Supabase JWT**(role=`authenticated`, 커스텀 클레임 `member_id`, §2)로 Realtime을 구독한다. RLS가 방 멤버만 통과시킨다. **쓰기는 클라가 직접 못 하게 막고**(§3, 모든 insert는 Spring 경유), Spring은 **owner role로 접속해 RLS를 우회**해 insert 한다.

```sql
alter table message          enable row level security;
alter table chat_room_member enable row level security;
alter table chat_room        enable row level security;

-- 내 멤버십 행만 조회
create policy crm_select_self on chat_room_member for select to authenticated
  using (member_id = (auth.jwt() ->> 'member_id')::bigint);

-- 내가 속한 방만 조회
create policy room_select_member on chat_room for select to authenticated
  using (exists (select 1 from chat_room_member m
                 where m.room_id = chat_room.id
                   and m.member_id = (auth.jwt() ->> 'member_id')::bigint));

-- 메시지: 그 방의 승인 멤버만 SELECT (Realtime postgres_changes 도 이 정책을 따른다)
create policy msg_select_member on message for select to authenticated
  using (exists (select 1 from chat_room_member m
                 where m.room_id = message.room_id
                   and m.member_id = (auth.jwt() ->> 'member_id')::bigint));
--   ↑ role IN ('HOST','PARTICIPANT') 는 chat_room_member 존재 자체가 곧 승인이므로 생략.
--     (탈퇴/거절 시 행 삭제 → 즉시 차단, §12)

-- authenticated(클라) 의 쓰기는 전면 차단. 모든 write 는 Spring(owner) 경유.
create policy msg_no_client_write on message for insert to authenticated with check (false);
create policy msg_no_client_upd   on message for update to authenticated using (false);
create policy msg_no_client_del   on message for delete to authenticated using (false);
```

> **owner 우회 주의:** Postgres에서 테이블 소유자는 기본적으로 RLS를 우회한다(`FORCE ROW LEVEL SECURITY` 를 걸지 않는 한). Spring이 owner role이면 위 `false` insert 정책에도 불구하고 정상 insert 된다. Spring이 **비-owner role**이면 `service_role` 키/전용 정책이 필요하다 → **배포 시 DB role 권한 확정 필수(⚠️).**
> Supabase `postgres_changes` Realtime은 구독 시 RLS를 평가하므로, 위 `msg_select_member` 하나로 방별 수신 권한이 자동 통제된다(별도 채널 인가 코드 불필요).

---

## 2. Supabase JWT 브릿지 (Spring 발급)

Supabase Realtime/RLS는 **Supabase 프로젝트의 JWT secret(HS256)** 으로 서명된 토큰을 요구한다. 우리 앱 JWT(`${JWT_SECRET}`)와 **다른 시크릿**이다. Spring이 인증된 사용자에게 Supabase용 단기 토큰을 발급한다.

**엔드포인트**
```
POST /chat/token           (앱 인증 쿠키 필요; MemberPrincipal 에서 memberId 획득)
200 OK
{
  "token":      "<jwt>",           // Supabase access token 으로 사용
  "expiresIn":  3600,
  "supabaseUrl":"https://<proj>.supabase.co",
  "supabaseAnonKey":"<anon>"       // 클라 supabase-js 초기화용(공개 키)
}
```

**클레임 설계** (HS256, secret = `SUPABASE_JWT_SECRET` env)
```json
{
  "sub":       "<memberId>",       // 문자열
  "role":      "authenticated",    // Supabase 필수: RLS to authenticated
  "aud":       "authenticated",    // 필수
  "member_id": 12345,              // 커스텀 클레임(bigint) — RLS 가 auth.jwt()->>'member_id' 로 사용
  "iat":       <now>,
  "exp":       <now+3600>          // 단기(1h). 만료 전 클라가 재발급
}
```
- 구현: `io.jsonwebtoken`(jjwt, 이미 의존 `build.gradle:57-59`)로 별도 시크릿 서명. 기존 `JwtTokenProvider` 재사용 말고 **전용 `SupabaseTokenProvider`** 신설(시크릿·클레임이 다름).
- 방별 멤버십은 **클레임에 넣지 않는다**(챌린지 수백 개·동적). 방 접근통제는 RLS가 `chat_room_member`로 판정(§1.4).
- 재발급: 클라가 `exp` 60초 전 `POST /chat/token` 재호출 → `supabase.realtime.setAuth(newToken)`.

---

## 3. 쓰기 경로 — Spring 엔드포인트

모든 메시지 insert는 Spring을 통한다(참여자 검증 + 멱등 + FCM 팬아웃 훅을 한 곳에서).

```
POST /chat/rooms/{roomId}/messages          (앱 인증 쿠키)
body {
  "type":            "TEXT",                 // 기본 TEXT; §10 확장 타입
  "content":         "안녕하세요",            // TEXT/ANNOUNCEMENT 필수, 그 외 null 가능
  "payload":         { ... },                // 타입별(§10). 기본 {}
  "clientMessageId": "uuid-v4"               // 멱등키(§11 중복전송)
}
201 Created
{
  "id":            9007,
  "roomId":        42,
  "senderId":      12345,
  "type":          "TEXT",
  "content":       "안녕하세요",
  "payload":       {},
  "createdAt":     "2026-07-19T09:12:33.481Z",
  "cursor":        "MTcyMTk4Mzk1MzQ4MTo5MDA3"   // (created_at,id) 인코딩(§5)
}
```

**서버 처리 순서**
1. `roomId` → `chat_room.challenge_id` 조회.
2. **권한 검증:** 호출자 memberId가 해당 challenge의 `participant.status ∈ {PARTICIPANT, HOST}` 인지 확인(기존 규칙 재사용, `ChallengeService.java:786` 패턴). 실패 → `403 CHAT-FORBIDDEN`.
   - `ANNOUNCEMENT` 타입은 추가로 `status = HOST` 요구(§7). 실패 → `403 CHAT-ANNOUNCE-FORBIDDEN`.
3. **타입별 검증 훅:** `ChatMessageTypeHandler.validate(type, content, payload)` (§10). 실패 → `400 CHAT-INVALID-PAYLOAD`.
4. **멱등 insert:** `(room_id, sender_id, client_message_id)` UNIQUE 충돌 시 기존 행 조회해 그대로 반환(중복 200/201 동일 응답, §11).
5. insert(JPA) — `created_at = DB now()`. owner role이라 RLS 우회.
6. **FCM 팬아웃(async):** 트랜잭션 커밋 후 `@TransactionalEventListener(AFTER_COMMIT)` 로 §9 발행(온라인은 Realtime이 이미 전달, 오프라인만 실질 수신).
7. Realtime은 insert를 WAL로 감지해 구독 클라에 자동 push(서버 추가 작업 없음).

**부가 엔드포인트**
```
POST   /chat/rooms/{roomId}/read           body { "lastReadMessageId": 9007 }   // 읽음 갱신(§6)
GET    /chat/rooms/{roomId}/messages       ?cursor=&limit=            // 과거 페이지(§5)
GET    /chat/rooms/{roomId}/messages/{messageId}/context  ?before=30&after=30   // jump(§5.2)
POST   /chat/rooms/{roomId}/announcement   body { "messageId": 9007 }   // 공지 고정/변경(§7, HOST)
DELETE /chat/rooms/{roomId}/announcement                              // 공지 해제(§7, HOST)
```

> 설계 선택: 과거 페이지·jump·미읽음도 **Spring REST**로 제공(Realtime은 신규 insert 스트림 전용). 이유: 커서/윈도우 로직을 서버가 소유해 정렬 안정성·권한을 일관 통제. Realtime 구독은 "지금부터의 신규 메시지"만 담당.

---

## 4. 읽기 경로 — Supabase Realtime 구독 (웹 + Flutter WebView)

채팅 UI는 **웹 1벌**로 구현되고 Flutter는 그 웹을 WebView로 렌더한다(별도 Flutter Realtime 클라 없음). 따라서 구독 코드는 웹 `@supabase/supabase-js` 하나.

```ts
// 1) Spring 토큰으로 supabase-js 초기화
const { token, supabaseUrl, supabaseAnonKey } = await fetch('/chat/token').then(r => r.json());
const supabase = createClient(supabaseUrl, supabaseAnonKey);
supabase.realtime.setAuth(token);           // RLS 적용 대상

// 2) 방별 채널 구독 — postgres_changes(INSERT) on message, room 필터
const channel = supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'message', filter: `room_id=eq.${roomId}` },
      (payload) => appendMessage(payload.new))   // RLS 통과분만 도착
  .subscribe();

// 3) 초기 로드는 REST(§5)로 최근 N개 → 이후 신규는 위 구독으로 append
// 4) 토큰 만료 전 재발급 후 supabase.realtime.setAuth(newToken)
```

- **필터 + RLS 이중:** `filter: room_id=eq` 는 전송량 최적화, `msg_select_member` RLS는 권한 강제. 둘 다 필요.
- **Flutter WebView 제약(⚠️, 클라 레포 근거):** iOS WebView가 App-Bound Domains ON(`_1d1s_app/lib/screens/hybrid_shell.dart:190-197`). Realtime WebSocket 호스트(`<proj>.supabase.co`)를 **`Info.plist` `WKAppBoundDomains`(최대 10)에 추가**하지 않으면 소켓 차단. Flutter 셸 작업 항목.
- **UPDATE/DELETE 구독(선택):** 편집/삭제 반영이 필요하면 `event: '*'` 로 확장(soft delete `deleted_at` 세팅을 UPDATE로 수신). MVP는 INSERT만.

---

## 5. 페이지네이션 & Jump-to-message

### 5.1 커서 기반 과거 무한스크롤

**정렬 키:** `(created_at, id)` 복합. `id`(bigint identity)가 단조 증가라 타이브레이커로 완결적 → **안정 정렬 보장**(같은 밀리초 다중 insert도 결정적 순서).

**커서 규격:** 불투명 문자열. `base64("{created_at_epoch_micros}:{id}")`.
예: `(2026-07-19T09:12:33.481Z, 9007)` → `MTcyMTk4Mzk1MzM0ODE6OTAwNw`.

**과거 로딩 쿼리** (최신→과거 스크롤; 첫 로드는 cursor 생략 → 최신 N개)
```sql
SELECT * FROM message
WHERE room_id = :roomId
  AND deleted_at IS NULL
  AND (:cursor IS NULL OR (created_at, id) < (:cursorTs, :cursorId))
ORDER BY created_at DESC, id DESC
LIMIT :limit;               -- 예: 30
```
**응답 형식**
```json
{
  "messages": [ /* created_at DESC. 클라는 역순으로 렌더 */ ],
  "nextCursor": "MTcyMTk4...",   // 이 페이지의 가장 오래된 (created_at,id). 없으면 null
  "hasMore": true
}
```
- `nextCursor` 를 다음 요청 `?cursor=` 로 넘겨 계속 과거 로드.
- **최신 방향(재연결 gap 메움)**: `(created_at, id) > (cursor)` + `ORDER BY ASC` 로 대칭 제공(§11 재연결).

### 5.2 Jump-to-message (알림·답장·검색 진입)

특정 `messageId`로 진입 시 그 메시지를 **앵커**로 주변 컨텍스트 윈도우를 로드.

```
GET /chat/rooms/{roomId}/messages/{messageId}/context?before=30&after=30
```
**서버 로직**
1. 앵커 조회: `SELECT created_at, id FROM message WHERE id=:messageId AND room_id=:roomId` (권한: 호출자 방 멤버 확인). 없거나 삭제 → `404`.
2. before(과거):
   ```sql
   SELECT * FROM message WHERE room_id=:roomId AND deleted_at IS NULL
     AND (created_at, id) < (:anchorTs, :anchorId)
   ORDER BY created_at DESC, id DESC LIMIT :before;
   ```
3. after(이후, 앵커 포함):
   ```sql
   SELECT * FROM message WHERE room_id=:roomId AND deleted_at IS NULL
     AND (created_at, id) >= (:anchorTs, :anchorId)
   ORDER BY created_at ASC, id ASC LIMIT :after + 1;
   ```
4. 병합(시간 오름차순) 후 반환.

**응답 형식**
```json
{
  "anchorMessageId": 9007,
  "messages": [ /* created_at ASC, 앵커 포함 */ ],
  "olderCursor": "…",   // 윈도우 최상단보다 과거 로드용((created_at,id) < 첫 항목)
  "newerCursor": "…",   // 윈도우 최하단보다 이후 로드용((created_at,id) > 마지막 항목)
  "hasOlder": true,
  "hasNewer": true
}
```
- 클라: `messages` 렌더 → `anchorMessageId` 로 스크롤·하이라이트 → 위/아래 스크롤 시 `olderCursor`/`newerCursor` 로 §5.1 대칭 확장.
- 동일 인덱스 `idx_message_room_created_id` 가 양방향 모두 커버.

---

## 6. 읽음 / 안읽음 카운트

- 기준: `chat_room_member.last_read_message_id`.
- **읽음 갱신:** `POST /chat/rooms/{roomId}/read { lastReadMessageId }` → `UPDATE chat_room_member SET last_read_message_id = GREATEST(coalesce(last_read_message_id,0), :id) WHERE room_id=:roomId AND member_id=:me` (역행 방지 GREATEST).
- **방별 미읽음 수:**
  ```sql
  SELECT count(*) FROM message
  WHERE room_id=:roomId AND deleted_at IS NULL
    AND sender_id <> :me
    AND id > coalesce((SELECT last_read_message_id FROM chat_room_member
                       WHERE room_id=:roomId AND member_id=:me), 0);
  ```
  `idx_message_room_id (room_id, id)` 로 범위 스캔. 수만 MAU·중저빈도에선 충분.
- **전체 미읽음 뱃지:** 내 `chat_room_member` 각 방을 위 카운트 합산(방 수가 많으면 캐시/집계 테이블은 확장 항목).
- **타이핑 인디케이터: 확장(별도 저장 안 함).** Supabase Realtime **Broadcast/Presence** 채널로 클라간 직접 교환(DB 미기록) 또는 후속 RTDB. MVP 제외.

---

## 7. 공지 기능 (상단 고정)

**설계 선택 — 트레이드오프**

| 안 | 구조 | 장점 | 단점 |
|---|---|---|---|
| A. 별도 `announcement` 테이블 | 공지 전용 행 | 공지 생명주기 독립·이력 명확 | 테이블/구독/조인 추가, 채팅 흐름과 분리 |
| **B. `message.type='ANNOUNCEMENT'` + `chat_room.pinned_message_id`** (권장) | 공지도 메시지, 방이 1개를 고정 포인터로 지목 | **메시지 인프라(Realtime·페이지네이션·jump) 재사용**, 인라인+상단 동시 노출, 마이그레이션 0 | 메시지 테이블에 종류 혼재(단 §10 설계가 이미 이를 전제) |

**권장 = B.** §10의 type+payload 확장 모델과 정확히 일치.

- **작성(고정):** `POST /chat/rooms/{roomId}/messages {type:'ANNOUNCEMENT', content}` → §3 권한검증에서 **`status=HOST` 강제**. insert 후 `chat_room.pinned_message_id = 새 message.id` 세팅(같은 트랜잭션). 또는 기존 메시지를 고정: `POST /chat/rooms/{roomId}/announcement {messageId}`.
- **노출:** 방 진입 시 `chat_room.pinned_message_id` → 해당 message 조회해 상단 배너 렌더. Realtime로 `chat_room` UPDATE 구독 시 실시간 공지 변경 반영(선택).
- **수정:** 공지 메시지 `content` edit(`edited_at` 갱신), HOST 한정.
- **해제:** `DELETE /chat/rooms/{roomId}/announcement` → `pinned_message_id = null`, HOST 한정.
- **이력:** `SELECT * FROM message WHERE room_id=? AND type='ANNOUNCEMENT' ORDER BY created_at DESC`.
- 권한: 작성/고정/수정/해제 전부 `status=HOST`. 일반 참여자는 읽기만.

---

## 8. (통합) 메시지 송수신 요약 시퀀스

```
[송신] 클라 → POST /chat/rooms/{id}/messages (앱쿠키, clientMessageId)
        → Spring: 권한검증(PARTICIPANT|HOST) → 타입검증 → 멱등 insert(owner, created_at=now())
        → 201 반환(낙관적 UI 확정) + AFTER_COMMIT 이벤트
[수신-온라인] Postgres WAL → Supabase Realtime → 구독 클라(RLS 통과) append
[수신-오프라인] AFTER_COMMIT → FCM 팬아웃(§9) → 네이티브 알림 → 탭 시 push_route 로 방/메시지 진입
```

---

## 9. FCM 팬아웃 시퀀스 (온라인=Realtime, 오프라인=FCM)

§1.7(견적서) 최대 리스크(백그라운드/종료 수신)를 FCM으로 해결. **FCM 전송 자체는 무료.**

**시퀀스**
```
1. 메시지 커밋 (AFTER_COMMIT 이벤트)
2. 수신 대상 = chat_room_member(room_id) − 발신자 − muted=true 제외
3. 각 대상의 FCM 토큰 조회: notification_endpoint WHERE member_id IN(...) AND channel='FCM' AND is_active
4. NotificationPreference opt-out 존중(기존 로직 재사용)
5. FCM multicast(최대 500 토큰/요청) 전송:
   - notification: { title: 방/챌린지명, body: notificationText(type,payload) }
   - data:        { roomId, messageId, type, deeplink: "/challenge/{challengeId}/chat?messageId={id}" }
6. 클라(포그라운드·해당 방 열림): data-only 처리로 알림 억제(중복 방지)
   클라(백그라운드/종료): 시스템 알림 표시 → 탭 → push_route(deeplink) → jump(§5.2)
```

- **온·오프라인 판별:** Spring이 Realtime presence를 알기 어렵다 → **MVP는 "발신자 제외 전원에게 FCM 전송 + 클라가 현재 방 열림/포그라운드면 억제"** 방식(단순·견고). 정밀 presence 기반 억제는 확장(Supabase Presence 조회).
- **토큰 저장:** 기존 `notification_endpoint` 재사용. FCM은 `endpoint_url` 대신 토큰 저장이 필요 → **`fcm_token varchar(255)` 컬럼 추가**하거나 `endpoint_url`에 토큰 저장 규약(권장: 명시적 컬럼, 별도 마이그레이션). 등록 API는 기존 Web Push 등록 훅(`useWebPushSubscription`) 옆에 FCM 토큰 등록 추가.
- **Flutter 작업(cross-repo):** `firebase_messaging` 통합 → 토큰 획득 → 브릿지 신규 메시지 `push_token` 으로 웹/서버 등록 → 알림 탭 핸들러가 `_handlePushRoute(deeplink)` 호출(기존 `push_route` 재사용, `_1d1s_app/lib/bridge/web_bridge.dart:550`).
- **서버 전송 구현:** 기존 `FallbackAppPushSender`(FCM stub) 자리를 실제 Firebase Admin SDK 전송으로 교체, 또는 신규 `FcmSender implements NotificationSender`. `NotificationDispatchService`(`:25-45`) 패턴 재사용.

---

## 10. ★ 확장성 명세 — 마이그레이션 없이 새 메시지 종류 추가

**원칙: `message.type`(문자열 enum) + `message.payload`(JSONB).** 신규 종류는 **DDL 변경 없이** `type` 값 + payload 스키마 + 렌더러만 추가.

### 10.1 타입별 payload 규약 (예시)

| type | content | payload 예 |
|---|---|---|
| `TEXT` | 본문 | `{}` |
| `ANNOUNCEMENT` | 공지 본문 | `{ "schema_version": 1 }` |
| `IMAGE` | null | `{ "schema_version":1, "url":"…", "w":1080,"h":720,"mime":"image/webp","size":204811 }` |
| `REPLY` | 본문 | `{ "schema_version":1, "replyTo": 8990, "preview":"원문 일부…" }` |
| `SYSTEM` | null | `{ "schema_version":1, "event":"member_joined", "memberId":123 }` |
| `POLL` | 질문 | `{ "schema_version":1, "options":[…], "closesAt":"…" }` |

- **버저닝:** payload에 `schema_version` 필수. 타입 구조 변경 시 버전 올리고 렌더러/핸들러가 분기(구버전 하위호환).
- content vs payload: 검색·미리보기가 필요한 텍스트는 `content`(인덱싱/미읽음 미리보기 용이), 구조화 데이터는 `payload`.

### 10.2 서버 훅 지점 (전략 패턴)

```java
interface ChatMessageTypeHandler {
  String type();                                   // "IMAGE" 등
  void validate(String content, JsonNode payload); // §3-3 검증 훅. 실패 시 예외→400
  default void onBeforeInsert(Message m) {}         // 부가 상태(예: POLL 생성)
  default void onAfterCommit(Message m) {}          // 타입별 사이드이펙트
  String notificationText(Message m);               // §9 FCM 본문 포맷
}
```
- 새 타입 = **`ChatMessageTypeHandler` 빈 1개 추가**(Spring 컴포넌트 스캔으로 자동 등록). 미등록 타입은 기본 핸들러(검증 없음·`content` 그대로)로 폴백하거나 거부(정책 선택).
- Realtime/페이지네이션/jump/RLS는 **타입 불문 동일**(행 스트리밍) → 손댈 필요 없음.
- FCM 본문만 `handler.notificationText()` 로 타입별 분기.

### 10.3 "새 메시지 종류 추가하는 법" (체크리스트)

1. `type` 문자열 상수 추가(서버·클라 공유 값).
2. payload 스키마 정의 + `schema_version` 부여(문서화).
3. (서버) 부가 검증/사이드이펙트 있으면 `ChatMessageTypeHandler` 빈 추가. 없으면 0.
4. (클라) 메시지 리스트에 해당 type 렌더러 추가.
5. (알림) `notificationText` 분기 추가(없으면 기본 "새 메시지").
6. **DDL·마이그레이션·Realtime·RLS 변경 없음.**

> IMAGE 첨부는 클라가 파일을 스토리지(Supabase Storage 또는 기존 presigned 업로드 `src/app.module/api/presignedUpload.ts`)에 올리고 **URL만 payload에 담아** §3 write. 서버는 바이너리 미취급.

---

## 11. 에러 / 엣지케이스

| 케이스 | 처리 |
|---|---|
| **중복 전송**(재시도·더블탭) | `client_message_id` UNIQUE(`uq_message_client`) → 충돌 시 기존 행 반환. 클라는 낙관적 메시지를 server id로 치환(중복 append 방지) |
| **메시지 순서** | 정렬은 항상 **서버 `(created_at,id)`**. 클라 낙관적 메시지는 `clientMessageId` 로 매칭해 ack 시 교체. 클라 시간 사용 금지 |
| **권한 실패(쓰기)** | Spring `403 CHAT-FORBIDDEN`(비멤버) / `CHAT-ANNOUNCE-FORBIDDEN`(비HOST 공지) |
| **권한 실패(읽기)** | RLS가 조용히 0행 → 구독해도 수신 없음. 클라엔 "접근 불가" 화면 별도 처리 |
| **멤버십 도중 상실**(탈퇴/강퇴) | §12로 `chat_room_member` 행 삭제 → RLS 즉시 차단(신규 수신 중단), Spring write `403`. 진행 중 구독은 다음 변경부터 미수신 |
| **Realtime 재연결 gap** | 소켓 끊김 동안 누락분 존재. 재연결 시 **마지막 수신 (created_at,id) 이후를 §5.1 최신방향(ASC)로 REST 재조회**해 메움 |
| **저사양 Android WebView eviction** | 백그라운드서 WebView·소켓 소멸 가능(클라 레포 근거 `hybrid_shell.dart`). 복귀 시 위 gap 메움 + 백그라운드 수신은 FCM(§9)이 보장 |
| **토큰 만료(Supabase JWT)** | `exp` 임박 시 `/chat/token` 재발급 → `realtime.setAuth`. 만료로 구독 끊기면 재구독 |
| **삭제 메시지** | `deleted_at` soft delete. 조회 쿼리 전부 `deleted_at IS NULL`. jump 앵커가 삭제됐으면 `404` → 클라는 근처로 폴백 |
| **INDIVIDUAL 챌린지** | 방 생성 안 함(§0). 요청 오면 `400/404` |
| **대형 방 FCM** | 500 토큰/멀티캐스트 배치, async. opt-out·muted 선반영 |

---

## 12. 멤버십 동기화 (participant 라이프사이클 ↔ chat_room_member)

`chat_room_member`는 RLS·미읽음의 단일 창구이므로 **participant 전이와 정확히 동기화**한다. 조인 포인트는 이미 inline 알림을 호출하는 4개 메서드(`ChallengeService.java`).

| 전이 | 메서드:라인 | chat_room_member 액션 |
|---|---|---|
| 승인 → PARTICIPANT | `acceptParticipant:652` | 방 없으면 생성 후 `upsert(role='PARTICIPANT')` |
| 챌린지 생성(host) | `createChallenge:144` | `chat_room` 생성 + host `upsert(role='HOST')` |
| 거절 → REJECTED | `rejectParticipant:672` | (해당 없음; 애초 미입장) |
| 탈퇴 → LEAVE | `leaveChallenge:753` | `DELETE FROM chat_room_member WHERE room_id,member_id` |
| 방장 위임 | `leaveChallengeHost:779` | 신규 host `role='HOST'`, 구 host 행 삭제 |
| 계정 탈퇴 | `withdrawMemberLeaveChallenge:732` | 모든 방에서 해당 member 행 삭제 |

- 구현: 각 메서드 말미에 `ChatMembershipService.sync(...)` 호출(기존 `notificationService` 호출과 동일 위치). 같은 트랜잭션 → 일관성.
- 초기 이관(기존 진행 중 챌린지): `GROUP` 챌린지 + `status ∈ {HOST,PARTICIPANT}` 참여자를 일괄 백필하는 1회성 마이그레이션/배치.
- ⚠️ 대안(트레이드오프): 별도 테이블 없이 RLS가 `participant` 를 직접 조인할 수도 있으나 — (a) `last_read_message_id` 저장 위치가 어차피 필요, (b) RLS가 매 변경마다 participant 조인 평가, (c) FK 컬럼명 `"memberId"`(camelCase) 쿼팅 이슈 → **denorm 테이블 채택**.

---

## 13. 미확인 · 가정 정리 (착수 전 확인)

- ⚠️ **Spring DB role 권한**: owner(RLS 우회) 여부 확정 → 우회 불가면 service_role 키 write 경로 별도 설계(§1.4).
- ⚠️ **Supabase Realtime 활성화**: 프로젝트에서 `message` 테이블 replication(publication) 활성 + `postgres_changes` 사용 가능 여부.
- ⚠️ **SUPABASE_JWT_SECRET** env 확보(§2). Supabase 대시보드 → Settings → API.
- ⚠️ `participationType` STRING 매핑·`GROUP` 값 문자열 확정(§0).
- ⚠️ 클라 승인상태 표기 불일치(`ACCEPTED` vs 서버 `PARTICIPANT`) — 게이트 기준값 최종 확정(견적서 §1.2 동일 이슈).
- ⚠️ Flutter `Info.plist` App-Bound Domains에 Supabase 호스트 추가(§4).
- 규모 가정: 수만 MAU·중저빈도(그룹챗) → 미읽음 count 쿼리·단일 인덱스로 충분. 초고빈도화 시 미읽음 집계 테이블·파티셔닝 재검토.

---

## 부록 — 산출물 순서 요약

DDL(`V45`) → RLS → `SupabaseTokenProvider`(§2) → write API(§3) → 멤버십 sync(§12) → 클라 Realtime 구독(§4) → 페이지네이션/jump(§5) → 읽음(§6) → 공지(§7) → FCM(§9, Flutter 포함) → 확장 핸들러(§10).
MVP 경계: §1~6 + §12(실시간 텍스트 송수신·페이지네이션·jump·읽음·멤버십). 공지(§7)·FCM(§9)·확장 타입(§10)은 후속.
