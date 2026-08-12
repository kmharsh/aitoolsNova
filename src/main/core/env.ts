import { EnvSchema, Env } from '../../shared/types';
import { logger } from '../services/logger';
import * as path from 'path';

let env: Env;

try {
  const result = EnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_PATH: process.env.DATABASE_PATH || path.join(process.cwd(), 'nova.db')
  });

  if (!result.success) {
    logger.error('Invalid Environment Configuration:', new Error(result.error.message));
    process.exit(1);
  }
  
  env = result.data;
} catch (e) {
  logger.error('Failed to parse environment variables', e instanceof Error ? e : new Error(String(e)));
  process.exit(1);
}

export { env };
