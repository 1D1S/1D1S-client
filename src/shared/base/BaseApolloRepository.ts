// src/repositories/BaseRepository.ts
import {
  ApolloClient,
  NormalizedCacheObject,
  DocumentNode,
  ApolloError,
  OperationVariables,
  ApolloQueryResult,
  FetchResult,
} from '@apollo/client';
import {
  GraphqlException,
  NetworkException,
  ParsingException,
} from '@/shared/exceptions/ServerExceptions';

export abstract class BaseApolloRepository {
  protected readonly client: ApolloClient<NormalizedCacheObject>;

  constructor(client: ApolloClient<NormalizedCacheObject>) {
    this.client = client;
  }

  /**
   * GraphQL 쿼리/뮤테이션 실행 후
   * - errors 체크
   * - data 추출
   * - fromJson 으로 모델 변환
   */
  protected async parseData<T>(
    operation: DocumentNode,
    variables: OperationVariables,
    fromJson: (json: unknown) => T,
    options?: {
      isMutation?: boolean;
      fetchPolicy?: 'cache-first' | 'network-only' | 'no-cache';
    }
  ): Promise<T | T[] | null> {
    try {
      let result: ApolloQueryResult<Record<string, unknown>> | FetchResult<Record<string, unknown>>;

      if (options?.isMutation) {
        result = await this.client.mutate({ mutation: operation, variables });
      } else {
        result = await this.client.query({
          query: operation,
          variables,
          fetchPolicy: options?.fetchPolicy ?? 'no-cache',
        });
      }

      // GraphQL-level 에러
      if ('errors' in result && result.errors?.length) {
        const devMsg = result.errors.map((error) => error.message).join('; ');
        throw new GraphqlException(devMsg, '서버 오류가 발생했습니다. 관리자에게 문의하세요.');
      }

      const data = result.data;
      if (!data || typeof data !== 'object') {
        return null;
      }

      // 타입 안전하게 캐스팅 및 키/페이로드 추출 (array destructuring)
      const dataObj = data as Record<string, unknown>;
      const [rootKey] = Object.keys(dataObj);
      if (!rootKey) {
        return null;
      }
      const payload = dataObj[rootKey];

      // payload 가 null 이거나 undefined 인 경우
      if (payload == null) {
        return null;
      } else if (Array.isArray(payload)) {
        return payload.map((item) => fromJson(item));
      } else if (typeof payload === 'object') {
        return fromJson(payload);
      } else {
        throw new ParsingException(
          `Unexpected payload type: ${typeof payload}`,
          '데이터 형식이 올바르지 않습니다.'
        );
      }
    } catch (err) {
      if (err instanceof ParsingException) {
        throw err;
      }

      if (err instanceof ApolloError) {
        const devMsg = err.message;
        const userMsg =
          err.networkError != null
            ? '네트워크 오류가 발생했습니다. 인터넷 연결을 확인하세요.'
            : '서버 응답 처리 중 오류가 발생했습니다.';
        throw new NetworkException(devMsg, userMsg);
      }

      throw err;
    }
  }
}
