import { describe, it, expect, vi } from 'vitest';
import { ToolRunner } from '../src/main/core/tools/ToolRunner';
import { toolRegistry } from '../src/main/core/tools/ToolRegistry';
import { BaseTool, RiskLevel, ToolContext } from '../src/main/core/tools/BaseTool';
import { z } from 'zod';

// Mock Tool
const InputSchema = z.object({ value: z.string() });
const OutputSchema = z.object({ result: z.string() });

class EchoTool extends BaseTool<z.infer<typeof InputSchema>, z.infer<typeof OutputSchema>> {
  readonly name = 'test.echo';
  readonly description = 'Echoes the value';
  readonly inputSchema = InputSchema;
  readonly outputSchema = OutputSchema;
  readonly riskLevel: RiskLevel = 'LOW';
  readonly requiresPermission = false;
  readonly timeoutMs = 1000;

  async execute(input: z.infer<typeof InputSchema>, context: ToolContext): Promise<z.infer<typeof OutputSchema>> {
    context.emitActivity(`Echoing: ${input.value}`);
    return { result: input.value };
  }
}

describe('ToolRunner', () => {
  it('should validate inputs and execute the tool', async () => {
    toolRegistry.register(new EchoTool());
    const runner = new ToolRunner();
    
    const context: ToolContext = { emitActivity: vi.fn() };
    
    // Valid Execution
    const out = await runner.execute('test.echo', { value: 'hello' }, context);
    expect(out.result).toBe('hello');
    expect(context.emitActivity).toHaveBeenCalledWith('Echoing: hello');
  });

  it('should throw a Zod validation error for invalid inputs', async () => {
    const runner = new ToolRunner();
    const context: ToolContext = { emitActivity: vi.fn() };
    
    // Invalid Execution (missing 'value' string)
    await expect(runner.execute('test.echo', { wrongField: 123 }, context))
      .rejects.toThrow();
  });
});
