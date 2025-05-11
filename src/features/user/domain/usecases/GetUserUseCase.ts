import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from '@/features/user/domain/repositories/IUserRepository';
import { UserDTO } from '@/features/user/domain/entities/UserDto';

@injectable()
export class GetUserUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<UserDTO | null> {
    return this.userRepository.findById(id);
  }
}
