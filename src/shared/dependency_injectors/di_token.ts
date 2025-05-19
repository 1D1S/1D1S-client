import { IUserRepository } from '@/features/user/domain/repositories/IUserRepository';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { AxiosInstance } from 'axios';
import { InjectionToken } from 'tsyringe';

export const DI_TOKENS = {
  AxiosInstance: Symbol.for('AxiosInstance') as InjectionToken<AxiosInstance>,
  ApolloClient: Symbol.for('ApolloClient') as InjectionToken<ApolloClient<NormalizedCacheObject>>,
  UserRepository: Symbol.for('UserRepository') as InjectionToken<IUserRepository>,
  // OnboardingRepository: Symbol.for('OnboardingRepository') as InjectionToken<IOnboardingRepository>,
};
