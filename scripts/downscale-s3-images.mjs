#!/usr/bin/env node
/**
 * S3 에 이미 올라간 이미지를 1회 일괄 다운스케일한다.
 *
 * 배경: 백엔드·CDN 어디에도 리사이즈 변환이 없어(S3 오리진 직접 서빙)
 * 업로드된 원본이 그대로 내려간다. 웹 클라이언트는 이제 업로드 시점에
 * 장변 1600px / JPEG 0.82 로 줄이지만, 그 전에 올라간 이미지는 그대로다.
 * 이 스크립트가 그 과거분을 한 번 정리한다.
 *
 * 설계 원칙
 *  - **같은 키에 덮어쓴다.** URL 이 DB 에 저장돼 있어 키가 바뀌면 링크가 깨진다.
 *  - **기본은 조회만 한다.** 실제 쓰기는 --apply 를 줘야 한다.
 *  - **원본을 먼저 백업한다.** --backup-prefix 로 복사한 뒤 덮어쓴다.
 *  - **줄어들 때만 쓴다.** 재인코딩 결과가 더 크면 건너뛴다.
 *
 * 실행법과 주의사항은 같은 폴더의 README.md 를 반드시 먼저 읽을 것.
 */

import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    bucket: { type: 'string' },
    region: { type: 'string', default: 'ap-northeast-2' },
    prefix: { type: 'string', default: '' },
    'max-edge': { type: 'string', default: '1600' },
    quality: { type: 'string', default: '82' },
    'min-bytes': { type: 'string', default: '150000' },
    concurrency: { type: 'string', default: '4' },
    limit: { type: 'string', default: '0' },
    'backup-prefix': { type: 'string', default: 'backup/pre-downscale/' },
    apply: { type: 'boolean', default: false },
    'no-backup': { type: 'boolean', default: false },
  },
});

if (!values.bucket) {
  console.error('--bucket 은 필수입니다. 예: --bucket odos-bucket-dev');
  process.exit(1);
}

const MAX_EDGE = Number(values['max-edge']);
const QUALITY = Number(values.quality);
const MIN_BYTES = Number(values['min-bytes']);
const CONCURRENCY = Number(values.concurrency);
const LIMIT = Number(values.limit);
const APPLY = values.apply;
const BACKUP = !values['no-backup'];

// 클라이언트 업로드 규칙(app.lib/compressImage.ts)과 같은 값이어야 한다.
// 한쪽만 바꾸면 과거분과 신규분의 크기가 갈린다.
if (MAX_EDGE !== 1600 || QUALITY !== 82) {
  console.warn(
    `[주의] 클라이언트 기본값(1600 / 0.82)과 다른 값으로 실행합니다: ${MAX_EDGE} / 0.${QUALITY}`
  );
}

const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
} =
  await import('@aws-sdk/client-s3').catch(() => {
    console.error(
      '@aws-sdk/client-s3 가 없습니다. README 의 설치 절차를 먼저 따르세요.'
    );
    process.exit(1);
  });

const sharp = (await import('sharp').catch(() => {
  console.error('sharp 가 없습니다. README 의 설치 절차를 먼저 따르세요.');
  process.exit(1);
})).default;

const s3 = new S3Client({ region: values.region });

// 클라이언트가 PUT 할 때 쓰는 값과 동일해야 한다. 덮어쓰면서 빠뜨리면
// 1년 immutable 캐시가 사라져 매 요청 재다운로드가 된다.
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
]);

function isBackupKey(key) {
  return key.startsWith(values['backup-prefix']);
}

async function* listObjects() {
  let token;
  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: values.bucket,
        Prefix: values.prefix,
        ContinuationToken: token,
      })
    );
    for (const object of page.Contents ?? []) {
      yield object;
    }
    token = page.NextContinuationToken;
  } while (token);
}

async function toBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function processOne(key) {
  const got = await s3.send(
    new GetObjectCommand({ Bucket: values.bucket, Key: key })
  );
  const contentType = got.ContentType ?? '';
  if (!IMAGE_TYPES.has(contentType)) {
    return { key, skipped: `이미지 아님(${contentType || 'unknown'})` };
  }

  const original = await toBuffer(got.Body);
  const image = sharp(original, { failOn: 'none' });
  const meta = await image.metadata();
  if (!meta.width || !meta.height) {
    return { key, skipped: '메타데이터 없음' };
  }

  const resized = await image
    // withoutEnlargement: 이미 작은 이미지를 키우지 않는다.
    .rotate() // EXIF orientation 반영 후 회전 정보 제거
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  if (resized.length >= original.length) {
    return { key, skipped: `줄지 않음(${original.length} → ${resized.length})` };
  }

  if (!APPLY) {
    return {
      key,
      before: original.length,
      after: resized.length,
      dryRun: true,
    };
  }

  if (BACKUP) {
    await s3.send(
      new CopyObjectCommand({
        Bucket: values.bucket,
        CopySource: `${values.bucket}/${encodeURIComponent(key)}`,
        Key: `${values['backup-prefix']}${key}`,
        MetadataDirective: 'COPY',
      })
    );
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: values.bucket,
      Key: key,
      Body: resized,
      // 원본이 PNG 였어도 내용은 JPEG 이 되므로 Content-Type 을 바꿔야 한다.
      ContentType: 'image/jpeg',
      CacheControl: CACHE_CONTROL,
    })
  );

  return { key, before: original.length, after: resized.length };
}

async function main() {
  const targets = [];
  for await (const object of listObjects()) {
    if (!object.Key || isBackupKey(object.Key)) {
      continue;
    }
    if ((object.Size ?? 0) < MIN_BYTES) {
      continue;
    }
    targets.push(object);
    if (LIMIT > 0 && targets.length >= LIMIT) {
      break;
    }
  }

  console.log(
    `${APPLY ? '적용' : '조회(dry-run)'} · 대상 ${targets.length}건 ` +
      `(${MIN_BYTES} bytes 이상, prefix="${values.prefix}")`
  );

  let before = 0;
  let after = 0;
  let changed = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((object) =>
        processOne(object.Key).catch((error) => ({
          key: object.Key,
          error: error?.message ?? String(error),
        }))
      )
    );

    for (const result of results) {
      if (result.error) {
        failed += 1;
        console.error(`  ! ${result.key} — ${result.error}`);
        continue;
      }
      if (result.skipped) {
        skipped += 1;
        continue;
      }
      changed += 1;
      before += result.before;
      after += result.after;
      const pct = Math.round((1 - result.after / result.before) * 100);
      console.log(
        `  ${result.dryRun ? '[dry]' : '[put]'} ${result.key} ` +
          `${(result.before / 1024).toFixed(0)}KB → ${(result.after / 1024).toFixed(0)}KB (-${pct}%)`
      );
    }
  }

  const saved = before - after;
  console.log(
    `\n대상 ${changed}건 변경${APPLY ? '' : ' 예정'} · 건너뜀 ${skipped} · 실패 ${failed}\n` +
      `합계 ${(before / 1024 / 1024).toFixed(1)}MB → ${(after / 1024 / 1024).toFixed(1)}MB ` +
      `(절감 ${(saved / 1024 / 1024).toFixed(1)}MB)`
  );
  if (!APPLY) {
    console.log('\n실제로 쓰려면 --apply 를 붙여 다시 실행하세요.');
  }
}

await main();
