import { container } from 'tsyringe';
import { IUserRepository } from '@/features/user/domain/repositories/IUserRepository';
import { UserRepositoryImpl } from '@/features/user/data/repositories/UserRepositoryImpl';
import { UserRepositoryMock } from '@/features/user/data/repositories/UserRepositoryMock';
import { DI_TOKENS } from '@/shared/dependency_injectors/di_token';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

container.registerInstance<IUserRepository>(
  DI_TOKENS.UserRepository,
  USE_MOCK
    ? new UserRepositoryMock()
    : new UserRepositoryImpl(
        container.resolve<ApolloClient<NormalizedCacheObject>>(DI_TOKENS.ApolloClient)
      )
);

export { container };
