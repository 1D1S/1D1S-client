import { IUserRepository } from '@/features/user/domain/repositories/IUserRepository';
import { AxiosInstance } from 'axios';
import { InjectionToken } from 'tsyringe';

export const DI_TOKENS = {
  AxiosInstance: Symbol.for('AxiosInstance') as InjectionToken<AxiosInstance>,
  UserRepository: Symbol.for('UserRepository') as InjectionToken<IUserRepository>,
  // OnboardingRepository: Symbol.for('OnboardingRepository') as InjectionToken<IOnboardingRepository>,
};
