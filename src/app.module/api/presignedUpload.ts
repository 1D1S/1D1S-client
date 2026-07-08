import { compressImageFile } from '@/app.lib/compressImage';

import { apiClient } from './client';
import { API_UPLOAD_TIMEOUT_MS } from './config';
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

// ② 스토리지 직접 PUT 업로드. Content-Type 이 ①에서 보낸 fileType 과
// 정확히 일치해야 S3 가 403 을 내지 않는다. 여기선 ①의 fileType 에
// file.type 을 넣었으므로 동일 file.type 으로 PUT 하면 항상 일치한다.
async function putToStorage(uploadUrl: string, file: File): Promise<void> {
  // raw fetch 는 기본 타임아웃이 없어 느린/멈춘 업로드가 무한정 hang 될 수
  // 있다. AbortController 로 큰 파일도 견딜 만큼 긴 상한만 건다.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`이미지 업로드 실패 (${response.status})`);
    }
  } finally {
    clearTimeout(timer);
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
