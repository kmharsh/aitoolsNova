import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_PATH: z.string().default('./nova.db'),
});

export type Env = z.infer<typeof EnvSchema>;

// Shared tool response
export interface ToolResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type AssistantState = 
  | 'IDLE' 
  | 'LISTENING' 
  | 'THINKING' 
  | 'PLANNING' 
  | 'EXECUTING' 
  | 'WAITING_FOR_PERMISSION' 
  | 'VERIFYING' 
  | 'BUILDING_HOLOGRAM'
  | 'COMPLETED' 
  | 'ERROR';
