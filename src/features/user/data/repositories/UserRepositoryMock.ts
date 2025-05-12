// src/data/repositories/UserRepositoryImpl.ts

import { IUserRepository } from '@/features/user/domain/repositories/IUserRepository';
import { UserModel } from '@/features/user/domain/entities/UserModel';

/**
 * 예시 레포지토리입니다.
 * - IUserRepository를 구현합니다.
 * - 실제 데이터베이스나 API와의 상호작용 없이
 *   Mock 데이터를 사용하여 테스트할 수 있습니다.
 */
export class UserRepositoryMock implements IUserRepository {
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