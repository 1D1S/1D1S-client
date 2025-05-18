// src/data/repositories/UserRepositoryImpl.ts

import { IUserRepository } from '@/features/user/domain/repositories/IUserRepository';
import { UserModel } from '@/features/user/domain/entities/UserModel';

import { BaseApolloRepository } from '@/shared/base/BaseApolloRepository';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  GetMemberDocument,
  GetMemberQuery,
  GetMemberQueryVariables,
} from '@/graphql/generated/graphql';

/**
 * 예시 레포지토리입니다.
 * - IUserRepository를 구현합니다.
 */
export class UserRepositoryImpl extends BaseApolloRepository implements IUserRepository {
  constructor(readonly client: ApolloClient<NormalizedCacheObject>) {
    super(client);
  }

  /**
   * #1 id로 사용자 검색
   * @param id 사용자 ID
   * @returns 사용자 ID 또는 null
   */
  async findById(id: string): Promise<UserModel | null> {
    return this.parseData<UserModel>(
      GetMemberDocument,
      { id } as GetMemberQueryVariables,
      (json) => {
        // GraphQL 쿼리 결과의 'member' 페이로드를 UserModel로 변환
        const member = (json as GetMemberQuery['member'])!;
        return UserModel.create({
          id: member.id,
          email: '',
          name: '',
        });
      },
      { fetchPolicy: 'network-only' }
    ) as Promise<UserModel | null>;
  }

  /**
   * #2 email로 사용자 검색
   * @param email 사용자 Email
   * @returns 사용자 ID 또는 null
   */
  async findByEmail(email: string): Promise<UserModel | null> {
    return UserModel.create({
      id: '',
      email: email,
      name: '',
    });
  }

  /**
   * #3 사용자 저장
   * @param id 사용자 ID
   */
  async save(id: string): Promise<void> {
    console.log(id);
  }

  /**
   * #4 사용자 삭제
   * @param id 사용자 ID
   */
  async delete(id: string): Promise<void> {
    console.log(id);
  }
}
