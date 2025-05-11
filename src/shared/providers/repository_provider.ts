import { container } from 'tsyringe';
import { IUserRepository } from '@/features/user/domain/repositories/IUserRepository';
import { UserRepositoryImpl } from '@/features/user/data/repositories/UserRepositoryImpl';
import { UserRepositoryMock } from '@/features/user/data/repositories/UserRepositoryMock';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { CreateUserUseCase } from '@/features/user/domain/usecases/CreateUserUseCase';
import { GetUserUseCase } from '@/features/user/domain/usecases/GetUserUseCase';

/**
 * 전역 의존성 주입 컨테이너 설정
 * tsyringe를 사용하여 프로젝트 전역에서 DI를 관리
 * 
 * 아래의 3가지를 설정
 * 1. 인터페이스 토큰 정의
 * 2. 환경에 따른 구현체 결정
 * 3. 컨테이너에 바인딩
 * 4. UseCase 바인딩
 */


// 인터페이스 토큰 정의
export const TYPES = {
  UserRepository: Symbol.for('UserRepository'),
};

const client = new ApolloClient({
  uri: process.env.GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
});

// 환경에 따른 구현체 결정
const isDevelopment = process.env.NODE_ENV === 'development';
const UserRepository = isDevelopment ? UserRepositoryMock : UserRepositoryImpl;

// 컨테이너에 바인딩
container.registerInstance(ApolloClient, client);
container.registerSingleton<IUserRepository>(TYPES.UserRepository, UserRepository);

// UseCase 바인딩
container.registerSingleton(CreateUserUseCase);
container.registerSingleton(GetUserUseCase);

export { container };
