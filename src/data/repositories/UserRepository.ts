// src/data/repositories/UserRepositoryImpl.ts

import { IUserRepository } from '@/domain/repositories/IUserRepository';

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
  async findById(id: string): Promise<string | null> {
    return id;
  }

  /**
   * #2 email로 사용자 검색
   * @param email 사용자 Email
   * @returns 사용자 ID 또는 null
   */
  async findByEmail(email: string): Promise<string | null> {
    return email;
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