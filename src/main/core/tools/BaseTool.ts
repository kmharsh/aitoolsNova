import { z } from 'zod';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ToolContext {
  abortSignal?: AbortSignal;
  emitActivity: (msg: string) => void;
}

export abstract class BaseTool<TInput, TOutput> {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly inputSchema: z.ZodSchema<TInput>;
  abstract readonly outputSchema: z.ZodSchema<TOutput>;
  abstract readonly riskLevel: RiskLevel;
  abstract readonly requiresPermission: boolean;
  abstract readonly timeoutMs: number;

  abstract execute(input: TInput, context: ToolContext): Promise<TOutput>;
}
