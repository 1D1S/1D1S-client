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

export function resolveDiaryImageUrl(
  rawImage: string | null | undefined
): string | null {
  if (!rawImage) {
    return null;
  }

  const trimmed = rawImage.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (!IMAGE_BASE_URL) {
    return null;
  }

  return `${IMAGE_BASE_URL}/${trimmed.replace(/^\/+/, '')}`;
}

export function resolveDiaryImageList(
  rawImages: string[] | string | null | undefined
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

