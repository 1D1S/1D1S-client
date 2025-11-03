import axios, { AxiosInstance } from 'axios';
import { container } from 'tsyringe';
import { DI_TOKENS } from './di_token';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api.example.com';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

container.registerInstance<AxiosInstance>(DI_TOKENS.AxiosInstance, axiosInstance);
