import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/*.ts',
  out: './src/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/canadian_driving_test',
  },
  verbose: true,
  strict: true,
} satisfies Config; 