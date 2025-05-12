// src/data/repositories/UserRepositoryImpl.ts

import { IUserRepository } from '@/features/user/domain/repositories/IUserRepository';
import { UserModel } from '@/features/user/domain/entities/UserModel';
//import { ApolloClient, FetchResult } from '@apollo/client';
//import { UserDTO } from '../../domain/entities/UserDto';



/**
 * 예시 레포지토리입니다.
 * - GraphQl Codegen을 사용하여 생성된 GraphQL 쿼리와 뮤테이션을 사용하여
 *   구현화합니다.
 */
// export class UserRepositoryImpl implements IUserRepository {
//   constructor(private readonly client: ApolloClient<any>) {}

//   async findById(id: string): Promise<UserDTO | null> {
//     const response: FetchResult<GetUserByIdQuery> =
//       await this.client.query<GetUserByIdQuery, GetUserByIdQueryVariables>({
//         query: GetUserByIdDocument,
//         variables: { id },
//       });

//     const payload = response.data.user;
//     if (payload.code !== 'OK200000') {
//       throw new Error(payload.message || 'Error fetching user');
//     }
//     if (!payload.data) return null;

//     return {
//       id: payload.data.id,
//       email: payload.data.email,
//       name: payload.data.name,
//     };
//   }

//   async findByEmail(email: string): Promise<UserDTO | null> {
//     // 유사하게 구현
//     throw new Error('Not implemented');
//   }
// }

/**
 * 예시 레포지토리입니다.
 * - IUserRepository를 구현합니다.
 */
export class UserRepositoryImpl implements IUserRepository {
  /**
   * #1 id로 사용자 검색
   * @param id 사용자 ID
   * @returns 사용자 ID 또는 null
   */
  async findById(id: string): Promise<UserModel | null> {
    return UserModel.create({
      id: id,
      email: '',
      name: ''
    });
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
      name: ''
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