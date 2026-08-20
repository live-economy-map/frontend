import axios from 'axios';
import { env } from '@/config/env';

export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  (typeof window !== 'undefined' &&
    (localStorage.getItem('USE_MOCK') === 'true' || localStorage.getItem('use_mock') === 'true')) ||
  false;

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL || import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});
