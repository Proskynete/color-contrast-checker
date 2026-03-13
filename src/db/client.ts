import { neon } from '@neondatabase/serverless';

if (!import.meta.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(import.meta.env.DATABASE_URL);
