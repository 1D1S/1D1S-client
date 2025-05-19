import { UserModel } from '@/features/user/domain/entities/UserModel';

/**
 * 예시 레포지토리 인터페이스
 * - 레포지토리 인터페이스를 정의합니다.
 * - 이후 data/repositories/UserRepository.ts에서 구현합니다.
 * - 인터페이스 파일 앞에는 I를 붙입니다.
 * **아래의 API들은 모두 예시입니다.**
 */
export interface IUserRepository {
  /**
   * #1 id로 사용자 검색
   * @param id 사용자 ID
   * @returns 사용자 ID 또는 null
   */
  findById(id: string): Promise<UserModel | null>;

  /**
   * #2 email로 사용자 검색
   * @param email 사용자 Email
   * @returns 사용자 ID 또는 null
   */
  findByEmail(email: string): Promise<UserModel | null>;

  /**
   * #3 사용자 저장
   * @param user 사용자 ID
   */
  save(user: string): Promise<void>;

  /**
   * #4 사용자 삭제
   * @param id 사용자 ID
   */
  delete(id: string): Promise<void>;
}
