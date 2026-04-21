# 브랜치 & 릴리즈 정책

---

## 브랜치 역할

| 브랜치    | 역할          | 배포 환경   |
| --------- | ------------- | ----------- |
| `develop` | 개발 통합     | Development |
| `main`    | 프로덕션 배포 | Production  |

---

## 브랜치 네이밍

| 종류     | 패턴                    | 예시                         |
| -------- | ----------------------- | ---------------------------- |
| 기능     | `feat/ODS-{번호}-설명`  | `feat/ODS-158-google-login`  |
| 버그     | `fix/ODS-{번호}-설명`   | `fix/ODS-142-token-error`    |
| 리팩토링 | `refac/ODS-{번호}-설명` | `refac/ODS-160-auth-cleanup` |

Notion 티켓 번호(`ODS-*`)를 브랜치명에 포함한다.

---

## 승격 흐름

```
feature/* ---> develop ---> main
                              |
                   즉시 동기화: main -> develop
```

1. 기능 개발 -> `develop` PR 생성 & 머지
2. 프로덕션 배포 -> `develop -> main` PR
3. 배포 완료 직후 -> `main -> develop` 동기화

---

## 머지 규칙

| 항목       | 규칙                            |
| ---------- | ------------------------------- |
| Feature PR | Squash merge 허용               |
| 승격 PR    | Create a merge commit 사용      |
| 직접 push  | `main`에 **금지** — PR로만 반영 |

---

## Hotfix 반영 규칙

```
hotfix -> main
       -> 즉시 역반영: main -> develop
```

**충돌 발생 시**: `develop` 기준으로 해소, hotfix 동작 유지 확인 필수

---

## 체크리스트

- [ ] Feature 브랜치가 Notion 티켓 번호를 포함하는가?
- [ ] 승격 PR에 **Create a merge commit** 사용했는가?
- [ ] `main` 머지 후 `main -> develop` 동기화 PR 생성했는가?
- [ ] hotfix 머지 후 역반영 PR 생성했는가?
