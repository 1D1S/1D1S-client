import { CreateUserUseCase } from '@/features/user/domain/usecases/CreateUserUseCase';
import { GetUserUseCase } from '@/features/user/domain/usecases/GetUserUseCase';
import { container } from 'tsyringe';

container.registerSingleton(CreateUserUseCase);
container.registerSingleton(GetUserUseCase);
