import imageCompression from 'browser-image-compression';

// 표시에 쓰는 최대 폭(next.config deviceSizes 최대=2048)에 맞춰 그 이상
// 해상도는 불필요하므로 리사이즈한다. 목표 용량을 함께 두어 초과 시
// 라이브러리가 품질을 자동으로 낮춰 맞춘다.
const COMPRESSION_OPTIONS = {
  maxWidthOrHeight: 2048,
  maxSizeMB: 1,
  useWebWorker: true,
};

/**
 * 업로드 직전 이미지 압축/리사이즈.
 *
 * 백엔드·Vercel 모두 리사이즈를 하지 않아 업로드한 원본이 그대로
 * 저장되고 목록/카드에서도 그대로 다운로드된다. 업로드 시점에 표시에
 * 충분한 크기로 줄여 저장 용량과 로딩 무게를 함께 낮춘다. EXIF
 * orientation 은 라이브러리가 보정하므로 iOS 세로 사진이 눕는 문제도
 * 방지된다. 압축이 실패하면 원본을 그대로 반환해 업로드 자체는 막지
 * 않는다.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // 이미 목표 용량 이하면 재인코딩으로 품질만 떨어뜨리지 않도록 통과.
  if (file.size <= COMPRESSION_OPTIONS.maxSizeMB * 1024 * 1024) {
    return file;
  }

  try {
    return await imageCompression(file, COMPRESSION_OPTIONS);
  } catch {
    return file;
  }
}
