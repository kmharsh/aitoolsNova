import { toolRegistry } from './ToolRegistry';
import { ToolContext } from './BaseTool';

export class ToolRunner {
  async execute(toolName: string, rawInput: any, context: ToolContext): Promise<any> {
    const tool = toolRegistry.get(toolName);
    
    if (!tool) {
      throw new Error(`Tool not found in registry: ${toolName}`);
    }

    // 1. Zod Input Validation
    // This strictly ensures the LLM didn't hallucinate invalid arguments
    const validatedInput = await tool.inputSchema.parseAsync(rawInput);

    // 2. Timeout and Execution
    return Promise.race([
      tool.execute(validatedInput, context),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Tool ${toolName} timed out after ${tool.timeoutMs}ms`));
        }, tool.timeoutMs);
      })
    ]);
  }
}
