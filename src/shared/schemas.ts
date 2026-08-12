import { z } from 'zod';

export const StepSchema = z.object({
  id: z.string(),
  description: z.string(),
  tool: z.string(),
  args: z.record(z.any()),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']).default('PENDING')
});

export const TaskSchema = z.object({
  id: z.string(),
  intent: z.string(),
  goal: z.string(),
  steps: z.array(StepSchema),
  tools: z.array(z.string()),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  requiresConfirmation: z.boolean(),
  status: z.enum(['PLANNING', 'WAITING_FOR_PERMISSION', 'EXECUTING', 'COMPLETED', 'ERROR']).default('PLANNING')
});

export type Step = z.infer<typeof StepSchema>;
export type Task = z.infer<typeof TaskSchema>;
