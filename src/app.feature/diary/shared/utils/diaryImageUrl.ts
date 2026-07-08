import { trimTrailingSlash } from '@module/utils/url';

const normalizeBaseUrl = (value?: string): string => {
  if (!value) {
    return '';
  }

  return trimTrailingSlash(value.trim());
};

const IMAGE_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_ODOS_IMAGE_URL ??
    process.env.NEXT_PUBLIC_ODOS_IMAGE_BASE_URL ??
    process.env.NEXT_PUBLIC_ODOS_API_URL
);

type RawImageRecord = Record<string, unknown>;

function pickImageString(rawImage: unknown): string | null {
  if (typeof rawImage === 'string') {
    const trimmed = rawImage.trim();
    return trimmed ? trimmed : null;
  }

  if (!rawImage || typeof rawImage !== 'object') {
    return null;
  }

  const imageRecord = rawImage as RawImageRecord;
  const candidates = [
    imageRecord.url,
    imageRecord.imageUrl,
    imageRecord.thumbnailUrl,
    imageRecord.fileUrl,
    imageRecord.src,
    imageRecord.path,
    imageRecord.key,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return null;
}

export function resolveDiaryImageUrl(rawImage: unknown): string | null {
  const trimmed = pickImageString(rawImage);
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^(blob:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('/images/') || trimmed.startsWith('/_next/')) {
    return trimmed;
  }

  const normalizedPath = trimmed.replace(/^\/+/, '');

  if (!IMAGE_BASE_URL) {
    return trimmed.startsWith('/') ? trimmed : `/${normalizedPath}`;
  }

  return `${IMAGE_BASE_URL}/${normalizedPath}`;
}

export function resolveDiaryImageList(rawImages: unknown): string[] | null {
  if (!rawImages) {
    return null;
  }

  const list = Array.isArray(rawImages) ? rawImages : [rawImages];
  const resolved = list
    .map((image) => resolveDiaryImageUrl(image))
    .filter((image): image is string => Boolean(image));

  return resolved.length > 0 ? resolved : null;
}

// 목록/피드/카드에 표시할 대표 이미지 한 장.
// 서버 thumbnailUrl 을 우선하고, 없으면(기존 데이터=null) imgUrl[0] 로
// fallback 한다. thumbnailUrl 이 raw 든 resolve 된 값이든 idempotent.
export function resolveDiaryThumbnail(
  thumbnailUrl: string | null | undefined,
  imgUrl: string[] | string | null | undefined
): string | undefined {
  return (
    resolveDiaryImageUrl(thumbnailUrl) ?? resolveDiaryImageList(imgUrl)?.[0]
  );
}

// resolve(IMAGE_BASE_URL prepend 등) 없이 백엔드 원본 문자열만 뽑는다.
// 수정 시 기존 이미지를 그대로 재전송할 때 사용 — 계약상 imgUrl 원본값을
// 변형 없이 다시 보내야 하기 때문(변형 시 400 DIARY-008).
export function extractDiaryImageList(rawImages: unknown): string[] | null {
  if (!rawImages) {
    return null;
  }

  const list = Array.isArray(rawImages) ? rawImages : [rawImages];
  const extracted = list
    .map((image) => pickImageString(image))
    .filter((image): image is string => Boolean(image));

  return extracted.length > 0 ? extracted : null;
}
