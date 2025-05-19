import { ApolloClient, from, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import axios, { AxiosInstance } from 'axios';
import { container } from 'tsyringe';
import { apolloLoggingLink } from '@/shared/lib/apollo_logging_link';
import { DI_TOKENS } from './di_token';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api.example.com';

const apolloClient = new ApolloClient({
  link: from([
    apolloLoggingLink,
    new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL!,
      credentials: 'same-origin',
    }),
  ]),
  cache: new InMemoryCache(),
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
});

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

container.registerInstance<AxiosInstance>(DI_TOKENS.AxiosInstance, axiosInstance);
container.registerInstance<ApolloClient<NormalizedCacheObject>>(
  DI_TOKENS.ApolloClient,
  apolloClient
);
