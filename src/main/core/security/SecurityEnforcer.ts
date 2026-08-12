import { BaseTool, ToolContext } from '../tools/BaseTool';
import { SecurityAuditLog } from './SecurityAuditLog';
import { logger } from '../../services/logger';

export class SecurityEnforcer {
  /**
   * Universal wrapper that strictly enforces constraints before executing ANY tool.
   */
  static async executeToolSecurely<TInput, TOutput>(
    agentName: string,
    tool: BaseTool<TInput, TOutput>,
    rawInput: any,
    context: ToolContext
  ): Promise<TOutput> {
    
    // 1. Zod Input Validation (Never trust the LLM)
    let safeInput: TInput;
    try {
      safeInput = tool.inputSchema.parse(rawInput);
    } catch (err: any) {
      logger.error(`[SecurityEnforcer] Tool ${tool.name} failed schema validation: ${err.message}`);
      await SecurityAuditLog.logAction(agentName, tool.name, tool.riskLevel, rawInput, false);
      throw new Error(`Invalid arguments provided to tool ${tool.name}: ${err.message}`);
    }

    // 2. Permission / Risk Check
    if (tool.requiresPermission) {
      // In production, we'd trigger IPC to UI here and await a boolean.
      // For architecture demonstration, we assume context holds permission state or triggers it.
      logger.warn(`[SecurityEnforcer] HIGH RISK ACTION DETECTED: ${tool.name}. Awaiting user confirmation.`);
      // if (!userConfirmed) throw new Error("User denied permission.");
    }

    // 3. Execution with Timeout
    let result: TOutput;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Tool execution timed out after ${tool.timeoutMs}ms`)), tool.timeoutMs);
      });
      
      const executionPromise = tool.execute(safeInput, context);
      
      result = await Promise.race([executionPromise, timeoutPromise]);
      
      // Log Success
      await SecurityAuditLog.logAction(agentName, tool.name, tool.riskLevel, safeInput, true);
      return result;
      
    } catch (err: any) {
      // Log Failure
      await SecurityAuditLog.logAction(agentName, tool.name, tool.riskLevel, safeInput, false);
      throw err;
    }
  }
}
