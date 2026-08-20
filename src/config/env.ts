import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().default('http://localhost:3000/api/v1'),
  VITE_APP_NAME: z.string().default('Live Economy Map'),
  VITE_APP_ENV: z.string().default('development'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('Invalid env:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      VITE_API_URL: 'http://localhost:3000/api/v1',
      VITE_APP_NAME: 'Live Economy Map',
      VITE_APP_ENV: 'development',
    };
