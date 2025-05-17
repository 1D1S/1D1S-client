// src/shared/base/BaseHttpRepository.ts

import { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import {
  NetworkException,
  ParsingException,
  RestException, // 만약 존재하지 않는다면, ServerExceptions에 새로 정의해 주세요.
} from '@/shared/exceptions/ServerExceptions';

export abstract class BaseAxiosRepository {
  protected readonly axios: AxiosInstance;

  constructor(axios: AxiosInstance) {
    this.axios = axios;
  }

  /**
   * Axios 요청을 래핑하여
   * - HTTP 상태 코드 에러 처리
   * - 네트워크 에러 처리
   * - JSON 파싱 및 fromJson 콜백으로 모델 변환
   */
  protected async parseData<T>(
    request: Promise<AxiosResponse<unknown>>,
    fromJson: (json: unknown) => T
  ): Promise<T | T[] | null> {
    try {
      const response = await request;
      const data = response.data;

      // 204 No Content 등 데이터가 비어있을 때
      if (data == null) {
        return null;
      }

      // 배열일 경우
      if (Array.isArray(data)) {
        return data.map((item) => fromJson(item));
      }

      // 객체일 경우
      if (typeof data === 'object') {
        return fromJson(data);
      }

      // 그 외 예기치 않은 타입
      throw new ParsingException(
        `Unexpected data type: ${typeof data}`,
        '데이터 형식이 올바르지 않습니다.'
      );
    } catch (err: unknown) {
      // 이미 파싱 예외라면 그대로 던지기
      if (err instanceof ParsingException) {
        throw err;
      }

      // AxiosError 처리
      if ((err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError;
        // 서버에서 응답(status ≥ 400)은 RestException으로 처리
        if (axiosErr.response) {
          throw new RestException(
            `HTTP ${axiosErr.response.status}: ${axiosErr.response.statusText}`,
            `서버 응답 오류가 발생했습니다. (${axiosErr.response.status})`
          );
        }
        // 네트워크 오류나 타임아웃
        throw new NetworkException(
          axiosErr.message,
          '네트워크 오류가 발생했습니다. 인터넷 연결을 확인하세요.'
        );
      }

      // 그 외 알 수 없는 에러
      throw err;
    }
  }
}
