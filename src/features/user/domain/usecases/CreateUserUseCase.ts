// src/domain/usecases/user/CreateUserUseCase.ts

import type { IUserRepository } from '@/features/user/domain/repositories/IUserRepository';
import { UserModel } from '@/features/user/domain/entities/UserModel';
import { inject } from 'tsyringe';

/**
 * CreateUserRequest
 * - 사용자 생성에 필요한 데이터 구조
 */
export interface CreateUserRequest {
  /** 사용자 ID */
  id: string;
  /** 사용자 이메일 */
  email: string;
  /** 사용자 이름 */
  name: string;
}

/**
 * CreateUserResponse
 * - 사용자 생성 후 반환 데이터 구조
 */
export interface CreateUserResponse {
  /** 생성된 사용자 ID */
  id: string;
  /** 생성된 이메일 */
  email: string;
  /** 생성된 이름 */
  name: string;
}

/**
 * CreateUserUseCase
 * - 사용자를 생성하는 유스케이스 구현체
 */
export class CreateUserUseCase {
    constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * #1: 사용자 생성
   *
   * @param request CreateUserRequest
   * @returns CreateUserResponse
   */
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const { id, email, name } = request;

    // User 엔티티 내부에서 값 객체 및 규칙 검증 수행
    const user = UserModel.create({ id, email, name });

    // 영속성 저장
    await this.userRepository.save(user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
