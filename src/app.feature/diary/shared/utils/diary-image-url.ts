const normalizeBaseUrl = (value?: string): string => {
  if (!value) {
    return '';
  }

  return value.trim().replace(/\/+$/, '');
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

export function resolveDiaryImageUrl(
  rawImage: unknown
): string | null {
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

export function resolveDiaryImageList(
  rawImages: unknown
): string[] | null {
  if (!rawImages) {
    return null;
  }

  const list = Array.isArray(rawImages) ? rawImages : [rawImages];
  const resolved = list
    .map((image) => resolveDiaryImageUrl(image))
    .filter((image): image is string => Boolean(image));

  return resolved.length > 0 ? resolved : null;
}
