import { compressImageFile } from '@/app.lib/compressImage';

import { apiClient } from './client';
import { requestData } from './request';

export interface PresignedUrlItem {
  /** 스토리지에 PUT 할 presigned URL (만료 10분) */
  uploadUrl: string;
  /** 업로드 완료 후 접근하는 최종 URL — diary imageUrls 에 담아 전송 */
  fileUrl: string;
}

interface PresignedUrlRequestItem {
  fileName: string;
  fileType: string;
}

// ① presigned URL 배치 발급 — 요청 개수/순서가 응답 배열과 그대로 대응
async function requestPresignedUrls(
  files: PresignedUrlRequestItem[]
): Promise<PresignedUrlItem[]> {
  return requestData<PresignedUrlItem[], PresignedUrlRequestItem[]>(
    apiClient,
    {
      url: '/image/presigned-urls',
      method: 'POST',
      data: files,
    }
  );
}

// presigned PUT 시 S3 오브젝트에 저장되는 캐시 정책. 백엔드가 presigned
// 서명에 이 값을 포함하므로, PUT 헤더도 한 글자까지 정확히 일치해야 S3 가
// 403 SignatureDoesNotMatch 를 내지 않는다. 업로드 URL 은 UUID 키라 내용이
// 바뀌지 않으므로 immutable + 1년 max-age 가 안전하다.
const IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

// presigned URL 로 스토리지에 직접 PUT 업로드하는 공용 헬퍼. 모든 이미지
// 업로드(단건/배치)가 이 함수를 지나가 Content-Type·Cache-Control 헤더를
// 한 곳에서만 관리한다. Content-Type 은 ①에서 서명한 fileType 과 일치해야
// 하며, HEIC 등 file.type 이 빈 문자열이면 image/jpeg 로 fallback 한다.
export async function putToStorage(
  uploadUrl: string,
  file: File
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'image/jpeg',
      'Cache-Control': IMAGE_CACHE_CONTROL,
    },
  });

  if (!response.ok) {
    throw new Error(`이미지 업로드 실패 (${response.status})`);
  }
}

/**
 * 파일 배열을 presigned 방식으로 업로드하고 최종 fileUrl 배열을 반환한다.
 * 입력 순서를 그대로 유지하며, 하나라도 실패하면 throw 한다.
 *
 * 흐름: 압축 → ① presigned 배치 발급 → ② PUT 업로드 → fileUrl 수집.
 */
export async function uploadImagesViaPresigned(
  files: File[]
): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  const compressed = await Promise.all(files.map(compressImageFile));
  const presigned = await requestPresignedUrls(
    compressed.map((file) => ({
      fileName: file.name,
      fileType: file.type,
    }))
  );

  // 응답 개수가 요청과 다르면 index 정렬이 깨져 undefined 가 fileUrl 에
  // 섞인다. 여기서 끊어 diary 요청에 잘못된 imageUrls 가 나가는 걸 막는다.
  if (presigned.length !== compressed.length) {
    throw new Error(
      `presigned 응답 개수 불일치 (요청 ${compressed.length}, 응답 ${presigned.length})`
    );
  }

  await Promise.all(
    presigned.map((item, index) =>
      putToStorage(item.uploadUrl, compressed[index])
    )
  );

  return presigned.map((item) => item.fileUrl);
}
