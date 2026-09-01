// 표시에 필요한 최대 크기. 히어로는 데스크톱에서 21:9 로 최대 1200px 폭,
// 카드·일지 사진은 그보다 작다. 2048 은 어느 화면에서도 쓰이지 않는 해상도를
// 저장·전송하고 있었다(실측: 히어로 원본 520KB PNG). 장변 1600 이면 2x DPR
// 기준으로도 충분하다.
const MAX_EDGE = 1600;

// JPEG 로 통일한다. PNG 사진은 같은 화질에서 몇 배 무겁고, 우리 이미지는
// 전부 사진·배너라 무손실이 필요 없다. 라이브러리가 JPEG 출력 시 캔버스를
// 흰색으로 먼저 채우므로 투명 PNG 도 검게 나오지 않는다.
const OUTPUT_TYPE = 'image/jpeg';
const OUTPUT_QUALITY = 0.82;

const COMPRESSION_OPTIONS = {
  maxWidthOrHeight: MAX_EDGE,
  maxSizeMB: 1,
  useWebWorker: true,
  fileType: OUTPUT_TYPE,
  initialQuality: OUTPUT_QUALITY,
};

/**
 * 확장자를 .jpg 로 바꾼다.
 *
 * 서버가 오브젝트 키를 `UUID_파일명` 으로 만들기 때문에, 재인코딩 후에도
 * 이름이 `photo.png` 면 키는 .png 인데 Content-Type 은 image/jpeg 인 물건이
 * 남는다. 표시에는 문제가 없지만 나중에 확장자로 타입을 판별하는 코드
 * (채팅 업로드가 이미 그렇게 한다)에서 어긋난다.
 */
export function toJpegFileName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'image.jpg';
  }

  const dotIndex = trimmed.lastIndexOf('.');
  // 앞에 이름이 있는 확장자만 교체한다('.gitkeep' 같은 건 통째로 유지).
  const base = dotIndex > 0 ? trimmed.slice(0, dotIndex) : trimmed;
  return `${base}.jpg`;
}

/**
 * 업로드 직전 이미지 축소/재인코딩.
 *
 * 백엔드·CDN 모두 리사이즈를 하지 않아(S3 오리진 직접 서빙, 변환 레이어
 * 없음) 업로드한 원본이 그대로 저장되고 목록·상세에서도 그대로 다운로드된다.
 * 그래서 업로드 시점이 크기를 줄일 수 있는 유일한 지점이다.
 *
 * EXIF orientation 은 라이브러리가 보정하므로 iOS 세로 사진이 눕지 않는다.
 * 압축이 실패하면 원본을 그대로 반환해 업로드 자체는 막지 않는다.
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
    const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
    if (compressed.type === file.type && file.type === OUTPUT_TYPE) {
      return compressed;
    }

    // 라이브러리는 원본 파일명을 그대로 물려주므로 확장자만 맞춰 다시 감싼다.
    return new File([compressed], toJpegFileName(file.name), {
      type: OUTPUT_TYPE,
      lastModified: compressed.lastModified,
    });
  } catch {
    return file;
  }
}
