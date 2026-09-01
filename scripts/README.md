# scripts

운영자가 직접 실행하는 1회성 스크립트. 앱 빌드에는 포함되지 않고,
의존성도 `package.json` 에 넣지 않는다(필요할 때만 임시 설치).

---

## downscale-s3-images.mjs — 기존 S3 이미지 일괄 다운스케일

### 왜 필요한가

백엔드·CDN 어디에도 이미지 리사이즈 변환이 없다. 이미지는 S3 오리진에서
그대로 서빙된다(`Server: AmazonS3`, CloudFront 없음, `?w=` 같은 쿼리 무시).
그래서 **업로드한 픽셀이 그대로 사용자에게 내려간다.**

웹 클라이언트는 이제 업로드 시점에 장변 1600px / JPEG 0.82 로 줄인다
(`src/app.lib/compressImage.ts`). 하지만 그 전에 올라간 이미지는 그대로
남아 있다(실측: 챌린지 히어로 520KB PNG). 이 스크립트가 과거분을 한 번
정리한다.

### 실행 전 반드시 확인

| 항목 | 내용 |
|---|---|
| **권한** | 버킷에 대한 `s3:ListBucket`, `s3:GetObject`, `s3:PutObject` 필요. 백업까지 하면 `s3:PutObject` 가 백업 prefix 에도 필요 |
| **덮어쓰기** | **같은 키에 덮어쓴다.** URL 이 DB 에 저장돼 있어 키를 바꾸면 링크가 깨지기 때문. 되돌리려면 백업본이 필요하다 |
| **버킷 버저닝** | 켜져 있으면 이전 버전이 남아 복구가 쉽다. 꺼져 있다면 `--backup-prefix` 백업(기본 켜짐)에 의존해야 한다 |
| **캐시** | 오브젝트가 `max-age=31536000, immutable` 이라, 이미 받아 간 브라우저는 새 이미지를 다시 받지 않는다. 대부분의 사용자에게는 영향이 없지만 "왜 나만 그대로냐"는 문의가 나올 수 있다 |
| **앱 업로드** | 이 스크립트는 이미 올라간 파일만 고친다. 네이티브 앱의 업로드 경로는 여전히 원본을 올리므로 앱 쪽 대응이 별도로 필요하다 |
| **먼저 dev 에서** | `odos-bucket-dev` 로 한 번 돌려보고 결과를 확인한 뒤 운영 버킷에 적용할 것 |

### 설치 (레포 의존성에 추가하지 않는다)

```bash
cd scripts
npm i --no-save @aws-sdk/client-s3 sharp
```

### 사용법

```bash
# 1) 조회만 — 아무것도 쓰지 않는다. 여기서 결과를 먼저 확인한다.
AWS_PROFILE=<프로필> node downscale-s3-images.mjs --bucket odos-bucket-dev

# 2) 소수만 실제 적용해서 눈으로 확인
AWS_PROFILE=<프로필> node downscale-s3-images.mjs \
  --bucket odos-bucket-dev --limit 5 --apply

# 3) 전체 적용
AWS_PROFILE=<프로필> node downscale-s3-images.mjs \
  --bucket odos-bucket-dev --apply
```

### 옵션

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `--bucket` | (필수) | 대상 버킷 |
| `--region` | `ap-northeast-2` | 리전 |
| `--prefix` | `` | 특정 prefix 만 대상 |
| `--max-edge` | `1600` | 장변 상한. **클라이언트와 같은 값을 유지할 것** |
| `--quality` | `82` | JPEG 품질. **클라이언트와 같은 값을 유지할 것** |
| `--min-bytes` | `150000` | 이 크기 미만은 건너뜀 |
| `--limit` | `0`(무제한) | 처리할 최대 개수 |
| `--concurrency` | `4` | 동시 처리 수 |
| `--backup-prefix` | `backup/pre-downscale/` | 원본 백업 위치 |
| `--apply` | 꺼짐 | **이걸 줘야 실제로 쓴다.** 없으면 조회만 |
| `--no-backup` | 꺼짐 | 백업 없이 덮어쓴다(버저닝이 켜져 있을 때만 권장) |

### 동작

1. 버킷을 순회하며 `--min-bytes` 이상인 오브젝트를 모은다(백업 prefix 는 제외).
2. Content-Type 이 이미지인 것만 처리한다.
3. EXIF 회전을 반영(`rotate()`)한 뒤 장변 상한으로 축소하고 JPEG 로 재인코딩한다.
   확대는 하지 않는다(`withoutEnlargement`).
4. **결과가 원본보다 크면 건너뛴다.**
5. `--apply` 일 때만: 원본을 백업 prefix 로 복사 → 같은 키에 덮어쓰기.
   `Content-Type: image/jpeg` 와 `Cache-Control` 을 다시 지정한다
   (빠뜨리면 1년 캐시가 사라져 매 요청 재다운로드가 된다).

### 되돌리기

백업을 켜고 돌렸다면 `backup/pre-downscale/<원래 키>` 에 원본이 있다.
같은 키로 다시 복사하면 복구된다.

```bash
aws s3 cp "s3://<버킷>/backup/pre-downscale/<키>" "s3://<버킷>/<키>" \
  --cache-control "public, max-age=31536000, immutable"
```
