import { ApolloLink, NextLink, Observable, Operation, FetchResult } from '@apollo/client';

/**
 * Apollo Client용 로깅 링크
 * - 요청 시작 시점에 쿼리·변수 로깅
 * - 응답 완료 시점에 처리 시간·에러 로깅
 */
export const apolloLoggingLink = new ApolloLink(
  (operation: Operation, forward: NextLink) => {
    const start = Date.now();
    console.log(
      `[GraphQL][start] ${operation.operationName}`,
      {
        query: operation.query.loc?.source.body,
        variables: operation.variables,
      }
    );

    // forward로부터 반환된 Observable을 감싸서 응답 시점에 로깅
    return new Observable<FetchResult>((observer) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          const duration = Date.now() - start;
          console.log(
            `[GraphQL][end] ${operation.operationName} → ${duration}ms`,
            {
              data: result.data,
              errors: result.errors,
            }
          );
          observer.next(result);
        },
        error: (error) => {
          console.error(
            `[GraphQL][error] ${operation.operationName}`,
            error
          );
          observer.error(error);
        },
        complete: () => {
          observer.complete();
        },
      });

      // 구독 해제 시에도 메모리 누수 방지
      return () => {
        subscription.unsubscribe();
      };
    });
  }
);