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
 *
 * 색공간 정규화: 라이브러리는 내부적으로 canvas 로 다시 그리는데, 2D
 * canvas 의 기본 색공간이 sRGB 라 iOS 의 Display P3(광색역) 사진도 sRGB 로
 * 변환된다. 예전엔 1MB 이하 파일을 그대로 통과시켜, 작은 P3 사진만
 * 프로필이 박힌 채 올라가 다른 이미지보다 과하게 쨍하게 보였다. 이제
 * 모든 이미지를 canvas 경유로 정규화해 표시 색감을 일관되게 맞춘다.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  try {
    const { default: imageCompression } = await import(
      'browser-image-compression'
    );
    return await imageCompression(file, COMPRESSION_OPTIONS);
  } catch {
    return file;
  }
}
